'use client'

import { useDraw } from "@/hooks/useDraw";
import { drawline } from "@/utils/drawline";
import { FC, useEffect, useState } from "react";
import { ChromePicker } from 'react-color'
import {io} from 'socket.io-client'
const socket = io('http://localhost:3001')

type DrawLineProps ={
  prevPoint : Point | null,
  currentPoint : Point,  
  color : string,
}
interface pageprops { }

const page: FC<pageprops> = ({ }) => {
  const [color, setColor] = useState<string>('#000')
  const { canvasRef, onMouseDown, clear } = useDraw(createLine)

  useEffect(()=>{
    socket.emit('client-ready')
    socket.on('get-canvas-state' , ()=>{
      if(!canvasRef.current?.toDataURL()) return 
      socket.emit('canvas-state' , canvasRef.current.toDataURL())
    })
    socket.on('canvas-state-from-server' , (state : string)=>{
      const img = new Image()
      img.src =  state
      img.onload = ()=>{
        ctx?.drawImage(img, 0 , 0)
      }
    })
    const ctx = canvasRef.current?.getContext('2d');
    socket.on('draw-line', ({ prevPoint, currentPoint, color } : DrawLineProps) =>{
      if(!ctx) return;
      drawline({prevPoint , currentPoint , ctx , color});
    })
    socket.on("clear" , clear)

    return ()=>{
      socket.off('client-ready')
      socket.off('canvas-state-from-server')
      socket.off('get-canvas-state')
      socket.off('clear')
    }
  },[canvasRef])
  
 
  function createLine({prevPoint , currentPoint , ctx}:Draw){
    socket.emit('draw-line' , ({prevPoint , currentPoint , color}))
    drawline({prevPoint , currentPoint , ctx , color })
    
  }

  return (
    <div className="border text-4xl w-screen h-screen flex justify-center items-center">
      <div className='flex flex-col gap-10 pr-10'> 
        <ChromePicker color={color} onChange={(e) => setColor(e.hex)} />
        <button type='button' className='p-2 rounded-md border border-black text-2xl font-medium' onClick={()=>{socket.emit('clear')}}>
          Clear canvas
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        height={750}
        width={750}
        className="border border-black"
      />
    </div>
  )
}

export default page