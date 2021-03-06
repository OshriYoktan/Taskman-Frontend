import './DrawNoteModal.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaintRoller, faTimes, faTint } from '@fortawesome/free-solid-svg-icons'
import React, { useRef, useState } from "react";
import { utilService } from '../../services/utilService';
import { useForm } from 'react-hook-form';

export function DrawNoteModal(props) {
    const [locations, setLocations] = useState([])
    const [dot_flag, setDot_flag] = useState(false)
    const [flag, setFlag] = useState(false)
    const [color, setColor] = useState('#000')
    const [backgroundColor, setBackgroundColor] = useState('#fff')
    const [title, setTitle] = useState('')
    const [inputSize, setInputSize] = useState(3)
    const canvasRef = useRef(null)
    const { register, handleSubmit, reset } = useForm();

    var prevX = 0, currX = 0, prevY = 0, currY = 0;

    const handleCanvasMouse = (e, res) => {
        let newLocation
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        setDot_flag(true)
        if (res === 'down') {
            setFlag(true);
            prevX = e.clientX;
            prevY = e.clientY;
            currX = e.clientX - canvas.getBoundingClientRect().left;
            currY = e.clientY - canvas.getBoundingClientRect().top;
            newLocation = { x: currX, y: currY }
            setLocations([...locations, newLocation])
            if (dot_flag) {
                ctx.beginPath();
                ctx.fillStyle = backgroundColor;
                ctx.fillRect(currX, currY, 2, 2);
                ctx.closePath();
                setDot_flag(false)
            }
        }
        if (res === 'up' || res === "out") {
            setFlag(false);
        }
        if (res === 'move') {
            if (flag) {
                prevX = currX;
                prevY = currY;
                currX = e.clientX - canvas.getBoundingClientRect().left;
                currY = e.clientY - canvas.getBoundingClientRect().top;
                newLocation = { x: currX, y: currY }
                setLocations([...locations, newLocation])
                draw(ctx);
            }
        }
    }

    const draw = (ctx) => {
        ctx.beginPath();
        ctx.moveTo(locations[locations.length - 1].x, locations[locations.length - 1].y);
        ctx.lineTo(currX, currY);
        ctx.strokeStyle = color;
        ctx.lineWidth = inputSize;
        ctx.stroke();
        ctx.closePath();
    }

    const handleClear = () => {
        setLocations([])
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, window.innerHeight, window.innerWidth)
        setBackgroundColor('#fff')
    }

    const handleSave = () => {
        const canvas = canvasRef.current
        var dataURL = canvas.toDataURL();
        const newAtt = { _id: utilService.makeId(), title: title || '', src: dataURL }
        console.log('newAtt:', newAtt)
        props.currTask.attachments.push(newAtt)
        props.updateBoard(props.currTask)
        reset({ title: '' })
        props.setDrawNoteModal(false)
    }

    const setBgcToCanvas = (bgc) => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, 300, 400);
        setBackgroundColor(bgc)
    }

    const setControllers = (res) => {
        setColor(res.inputColor)
        setInputSize(res.inputSize)
        if (res.inputBackgroungColor !== backgroundColor) setBgcToCanvas(res.inputBackgroungColor)
    }

    const setTitleName = (res) => {
        setTitle(res.title)
    }

    return (
        <div className="draw-note-modal">
            <section className="modal-header">
                <h3>Draw Note</h3>
                <p className="btn-close-icon" onClick={() => props.setDrawNoteModal(false)}><FontAwesomeIcon className="fa" icon={faTimes} /></p>
            </section>
            <section className="draw-note-modal-body">
                <div className="canvas-container">
                    <form onChange={handleSubmit(setTitleName)}>
                        <h3>Note Title</h3>
                        <input placeholder="Note Title" type="text" autoComplete="off" id="canvas-title" name="canvas-title"  {...register("title")} defaultValue='' onKeyDown={e => { if (e.key === 'Enter') e.preventDefault() }} />
                    </form>
                    <canvas ref={canvasRef} width='300px' height='400px' onMouseDown={res => handleCanvasMouse(res, 'down')} onMouseMove={res => handleCanvasMouse(res, 'move')} onMouseOut={res => handleCanvasMouse(res, 'out')} onMouseUp={res => handleCanvasMouse(res, 'up')} />
                    <form className="canvas-inputs" onChange={handleSubmit(setControllers)}>
                        <div>
                            <label htmlFor="input-color"><FontAwesomeIcon className="fa" icon={faTint} /> Color
                                <input type="color" id="input-color" name="input-color"  {...register("inputColor")} defaultValue={color} />
                            </label>
                            <label htmlFor="input-backgroungColor"><FontAwesomeIcon className="fa" icon={faPaintRoller} /> Background Color
                                <input type="color" id="input-backgroungColor" name="input-backgroungColor"  {...register("inputBackgroungColor")} defaultValue={'#fff'} />
                            </label>
                        </div>
                        <label htmlFor="input-size">size</label>
                        <input type="number" id="input-size" name="input-size"  {...register("inputSize")} defaultValue={inputSize} />
                    </form>
                    <div className="canvas-btns">
                        <button onClick={handleClear}>Clear</button>
                        <button onClick={handleSave}>Save</button>
                    </div>
                </div>
            </section>
        </div>
    )
}







