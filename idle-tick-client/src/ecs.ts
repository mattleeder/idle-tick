import { BitSet } from "./bitSet"
import type { Camera } from "./camera"
import type { CombatEngine } from "./combat_engine"
import type { Entity, ComponentType, Signature, ComponentTypeKeys, SystemTypeKeys } from "./ecs_types"
import { MAX_ENTITIES, MAX_COMPONENTS } from "./globals"
import type { TileMap } from "./tile_maps"

export abstract class System {
    entities = new Set<Entity>()
    coordinator: Coordinator
    
    constructor(coordinator: Coordinator) {
        this.coordinator = coordinator
        this.initialise()
    }

    abstract initialise(): void 
    abstract update(deltaTimeMs: number): void
    abstract tick(): void
}

class EntityManager {
    private entityIdQueue: Array<Entity>
    private signatures: Array<Signature>
    private livingEntityCount: number


    constructor() {
        // @TODO: make this an actual Queue
        this.entityIdQueue = Array.from({ length: MAX_ENTITIES }, (_, i) => i);
        this.signatures = Array.from({ length: MAX_ENTITIES }, () => new BitSet(MAX_COMPONENTS));
        this.livingEntityCount = 0
    }

    private getNextAvailableID(): Entity {
        const id = this.entityIdQueue.shift()
        if (id === undefined) {
            throw new Error("Out of IDs")
        }
        return id
    }

    createEntity(): Entity {
        if (this.livingEntityCount >= MAX_ENTITIES) {
            throw new Error("Too many entities in existence.")
        }

        const entityId = this.getNextAvailableID()
        this.livingEntityCount++
        return entityId
    }

    destroyEntity(entityId: Entity): void {
        if (entityId >= MAX_ENTITIES) {
            throw new Error("Entity out of range.")
        }

        this.entityIdQueue.push(entityId)
        this.signatures[entityId].reset()
        this.livingEntityCount--
    }

    setSignature(entityId: Entity, signature: Signature) {
        if (entityId >= MAX_ENTITIES) {
            throw new Error("Entity out of range.")
        }

        this.signatures[entityId] = signature
    }

    getSignature(entityId: Entity) {
        if (entityId >= MAX_ENTITIES) {
            throw new Error("Entity out of range.")
        }

        return this.signatures[entityId]
    }
}

interface IComponentArray<T> {
    entityDestroyed(entity: Entity): void
    insertData(entity: Entity, component: T): void
    removeData(entity: Entity): void
    getData(entity: Entity): T
    getDataWithDefault(entity: Entity, defaultValue: T): T
    entityDestroyed(entity: Entity): void
}

class ComponentArray<T> implements IComponentArray<T> {
    private componentArray: Array<T>
    private entityToIndexMap: Map<Entity, number>
    private indexToEntityMap: Map<number, Entity>
    private size: number

    constructor() {
        this.componentArray = []
        this.entityToIndexMap = new Map()
        this.indexToEntityMap = new Map()
        this.size = 0
    }

    insertData(entity: Entity, component: T): void  {
        if (this.entityToIndexMap.has(entity)) {
            throw new Error("Component added to the same entity more than once.")
        }

        const newIndex = this.size
        this.entityToIndexMap.set(entity, newIndex)
        this.indexToEntityMap.set(newIndex, entity)
        this.componentArray[newIndex] = component
        this.size++
    }

    removeData(entity: Entity): void {
        const indexOfRemovedEntity = this.entityToIndexMap.get(entity)

        if(indexOfRemovedEntity === undefined) {
            throw new Error("Cannot removeData: component does not exist on entity.")
        }

        const indexOfLastElement = this.size - 1
        this.componentArray[indexOfRemovedEntity] = this.componentArray[indexOfLastElement]

        const entityOfLastElement = this.indexToEntityMap.get(indexOfLastElement)

        if(entityOfLastElement === undefined) {
            throw new Error("Could not find indexOfLastElement in indexToEntityMap")
        }
            

        this.entityToIndexMap.set(entityOfLastElement, indexOfRemovedEntity)
        this.indexToEntityMap.set(indexOfRemovedEntity, entityOfLastElement)

        this.entityToIndexMap.delete(entity)
        this.indexToEntityMap.delete(indexOfLastElement)

        this.size--
    }

    getData(entity: Entity): T {
        const indexOfEntity = this.entityToIndexMap.get(entity)
        if(indexOfEntity === undefined) {
            throw new Error(`Cannot getData: component does not exist on entity: ${entity}.`)
        }

        return this.componentArray[indexOfEntity]
    }

    getDataWithDefault(entity: Entity, defaultValue: T): T {
        const indexOfEntity = this.entityToIndexMap.get(entity)
        if(indexOfEntity === undefined) {
            return defaultValue
        }

        return this.componentArray[indexOfEntity]
    }

    entityDestroyed(entity: Entity): void {
        if (this.entityToIndexMap.get(entity) !== undefined) {
            this.removeData(entity)
        }
    }
}

class ComponentTypeRegistry {
    private static nextId: number = 0;
    private static typeToId = new Map<ComponentTypeKeys, number>();
    
    static getTypeId(type: ComponentTypeKeys): number {
        if (!this.typeToId.has(type)) {
            this.typeToId.set(type, this.nextId++);
        }
        return this.typeToId.get(type)!;
    }
}

class ComponentManager {
    private typeIdToComponentType: Map<number, ComponentType> = new Map()
    private typeIdToComponentArrays: Map<number, IComponentArray<unknown>> = new Map()
    private nextComponentType: number = 0

    private getComponentArray<T>(componentTypeKey: ComponentTypeKeys): IComponentArray<T> {
        const typeIdentifier = ComponentTypeRegistry.getTypeId(componentTypeKey)

        const ret = this.typeIdToComponentArrays.get(typeIdentifier)

        if (ret === undefined) {
            throw new Error("Component not registered before use.")
        }

        return ret as IComponentArray<T>
    }

    registerComponent<T>(componentTypeKey: ComponentTypeKeys): void {
        const typeIdentifier = ComponentTypeRegistry.getTypeId(componentTypeKey)

        if (this.typeIdToComponentType.has(typeIdentifier)) {
            throw new Error("Registering component type more than once.")
        }

        this.typeIdToComponentType.set(typeIdentifier, this.nextComponentType)

        this.typeIdToComponentArrays.set(typeIdentifier, new ComponentArray<T>())

        this.nextComponentType++
    }

    getComponentType(componentTypeKey: ComponentTypeKeys): ComponentType {
        const typeIdentifier = ComponentTypeRegistry.getTypeId(componentTypeKey)
        const ret =  this.typeIdToComponentType.get(typeIdentifier)

        if (ret === undefined) {
            throw new Error("Component not registered before use.")
        }

        return ret
    }

    addComponent<T>(entity: Entity, componentTypeKey: ComponentTypeKeys, component: T): void {
        const componentArray = this.getComponentArray<T>(componentTypeKey)
        componentArray.insertData(entity, component)
    }

    removeComponent<T>(entity: Entity, componentTypeKey: ComponentTypeKeys): void {
        const componentArray = this.getComponentArray<T>(componentTypeKey)
        componentArray.removeData(entity)
    }

    getComponent<T>(entity: Entity, componentTypeKey: ComponentTypeKeys): T {
        try {
            const componentArray = this.getComponentArray<T>(componentTypeKey)
            return componentArray.getData(entity)
        } catch (e) {
            throw new Error(`Error getting :${componentTypeKey}: ${e}`)
        }
    }

    getComponentWithDefault<T>(entity: Entity, defaultValue: T, componentTypeKey: ComponentTypeKeys): T {
        const componentArray = this.getComponentArray<T>(componentTypeKey)
        return componentArray.getDataWithDefault(entity, defaultValue)
    }

    entityDestroyed(entity: Entity) {
        for (const componentArray of this.typeIdToComponentArrays.values()) {
            componentArray.entityDestroyed(entity)
        }
    }
}

class SystemTypeRegistry {
    private static nextId: number = 0;
    private static typeToId = new Map<SystemTypeKeys, number>();
    
    static getTypeId(type: SystemTypeKeys): number {
        if (!this.typeToId.has(type)) {
            this.typeToId.set(type, this.nextId++);
        }
        return this.typeToId.get(type)!;
    }
}

class SystemManager {
    private typeIdToSignatures: Map<number, Signature> = new Map()
    private typeIdToSystems: Map<number, System> = new Map()

    registerSystem<T extends System>(systemTypeKey: SystemTypeKeys, system: T): T {
        const typeIdentifier = SystemTypeRegistry.getTypeId(systemTypeKey)

        if (this.typeIdToSystems.has(typeIdentifier)) {
            throw new Error("Registering system more than once.")
        }

        this.typeIdToSystems.set(typeIdentifier, system)
        return system
    }

    setSignature(signature: Signature, systemTypeKey: SystemTypeKeys): void {
        const typeIdentifier = SystemTypeRegistry.getTypeId(systemTypeKey)

        if (!this.typeIdToSystems.has(typeIdentifier)) {
            throw new Error("System used before registration.")
        }
        
        this.typeIdToSignatures.set(typeIdentifier, signature)
    }

    entityDestroyed(entity: Entity): void {
        for (const system of this.typeIdToSystems.values()) {
            system.entities.delete(entity)
        }
    }

    entitySignatureChanged(entity: Entity, entitySignature: Signature): void {
        for (const [typeId, system] of this.typeIdToSystems.entries()) {
            const systemSignature = this.typeIdToSignatures.get(typeId)
            if (systemSignature === undefined) {
                throw new Error("Could not find system signature.")
            }

            // Does signature match
            if ((entitySignature.and(systemSignature).equals(systemSignature))) {
                system.entities.add(entity)
            } else {
                system.entities.delete(entity)
            }
        }
    }
}

export class Coordinator {
    private componentManager: ComponentManager
    private entityManager: EntityManager
    private systemManager: SystemManager
    private engine: CombatEngine
    
    ctx: CanvasRenderingContext2D
    camera: Camera
    tileMap: TileMap

    constructor(ctx: CanvasRenderingContext2D, camera: Camera, tileMap: TileMap, engine: CombatEngine) {
        this.componentManager = new ComponentManager()
        this.entityManager = new EntityManager()
        this.systemManager = new SystemManager()

        this.ctx = ctx
        this.camera = camera
        this.tileMap =  tileMap
        this.engine = engine
    }

    getEngine() {
        return this.engine
    }

    createEntity(): Entity {
        return this.entityManager.createEntity()
    }

    destroyEntity(entity: Entity) {
        this.entityManager.destroyEntity(entity)
        this.componentManager.entityDestroyed(entity)
        this.systemManager.entityDestroyed(entity)
    }

    registerComponent<T>(componentTypeKey: ComponentTypeKeys) {
        this.componentManager.registerComponent<T>(componentTypeKey)
    }

    addComponent<T>(entity: Entity, componentTypeKey: ComponentTypeKeys, component: T) {
        this.componentManager.addComponent<T>(entity, componentTypeKey, component)

        const signature = this.entityManager.getSignature(entity)
        
        signature.set(this.componentManager.getComponentType(componentTypeKey))
        this.entityManager.setSignature(entity, signature)

        this.systemManager.entitySignatureChanged(entity, signature)
    }

    removeComponent<T>(entity: Entity, componentTypeKey: ComponentTypeKeys) {
        this.componentManager.removeComponent<T>(entity, componentTypeKey)

        const signature = this.entityManager.getSignature(entity)
        signature.reset(this.componentManager.getComponentType(componentTypeKey))
        this.entityManager.setSignature(entity, signature)

        this.systemManager.entitySignatureChanged(entity, signature)
    }

    getComponent<T>(entity: Entity, componentTypeKey: ComponentTypeKeys) {
        return this.componentManager.getComponent<T>(entity, componentTypeKey)
    }

    getComponentWithDefault<T>(entity: Entity, defaultValue: T, componentTypeKey: ComponentTypeKeys) {
        return this.componentManager.getComponentWithDefault<T>(entity, defaultValue, componentTypeKey)
    }

    getComponentType(componentTypeKey: ComponentTypeKeys) {
        return this.componentManager.getComponentType(componentTypeKey)
    }

    registerSystem<T extends System>(systemTypeKey: SystemTypeKeys, system: T) {
        return this.systemManager.registerSystem<T>(systemTypeKey, system)
    }

    setSystemSignature(signature: Signature, systemTypeKey: SystemTypeKeys) {
        this.systemManager.setSignature(signature, systemTypeKey)
    }
}