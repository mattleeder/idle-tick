import { useEffect, useRef } from "react"
import { CombatEngine } from "./combat_engine"
import { BASE_HEIGHT, BASE_WIDTH, BASE_SCALE } from "./globals"

export function CombatWindow() {

    const canvasParentRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const combatEngineRef = useRef<CombatEngine>(null)
    const canvasWidth = BASE_WIDTH * BASE_SCALE
    const canvasHeight = BASE_HEIGHT * BASE_SCALE

    useEffect(() => {
        if (canvasRef.current !== null && canvasParentRef.current !== null) {
            const ctx = canvasRef.current.getContext("2d")

            if (ctx !== null) {
                ctx.scale(BASE_SCALE, BASE_SCALE)
                combatEngineRef.current = new CombatEngine(canvasRef.current, ctx, canvasParentRef.current)
                combatEngineRef.current.start()
            }
        }

        return () => {
            if (combatEngineRef.current !== null) {
                combatEngineRef.current.stop()
            }
        }
    })

    return (
        <>
          <h1>Combat</h1>
            <div ref={canvasParentRef} style={{"resize": "both", "overflow": "auto", "overscrollBehavior": "contain"}}>
              <canvas
                style={{"border": "solid black"}}
                width={`${canvasWidth}px`}
                height={`${canvasHeight}px`}
                ref={canvasRef}
                onContextMenu={(event) => {event.preventDefault()}}
                onMouseDown={(event) => {
                  if (combatEngineRef.current !== null)  {
                      combatEngineRef.current.onMouseDown(event)
                  }
                }}
                onMouseUp={(event) => {
                  if (combatEngineRef.current !== null)  {
                      combatEngineRef.current.onMouseUp(event)
                  }
                }}
                onMouseMove={(event) => {
                  if (combatEngineRef.current !== null)  {
                      combatEngineRef.current.onMouseMove(event)
                  }
                }}
              //   onMouseLeave={(event) => {
              //     if (combatEngineRef.current !== null)  {
              //         combatEngineRef.current.mouseLeaveHandler(event)
              //     }
              //   }}
                onWheel={(event) => {
                  event.preventDefault()
                  if (combatEngineRef.current !== null) {
                    combatEngineRef.current.onScroll(event)
                  }
                }}
              />
            </div>
        </>
    )
}