import { useEffect, useState } from 'react'
import Avatar from 'react-avatar'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { saveBoard, updateIsCloudLoader } from '../../store/actions/boardActions'
import Moment from 'react-moment';
import './BoardMenu.scss'
import { faChevronLeft, faPalette, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { utilService } from '../../services/utilService'
import { PolarArea, Bar } from 'react-chartjs-2';
import { Cloudinary } from '../Cloudinary/Cloudinary'
import loader from '../../assets/imgs/taskman-loader.svg'
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

export function BoardMenu({ boardMenuOp }) {
    const dispatch = useDispatch()
    const { register, handleSubmit, reset } = useForm();
    const currBoard = useSelector(state => state.boardReducer.currBoard)
    const user = useSelector(state => state.userReducer.user)
    const [isAbout, setIsAbout] = useState(false)
    const [isBackground, setIsBackground] = useState(false)
    const [isFilter, setIsFilter] = useState(false)
    const [isLabels, setIsLabels] = useState(false)
    const [labels, setLabels] = useState(null)
    const [cloudImgs, setCloudImgs] = useState(null)
    const [activity, setActivity] = useState(null)
    const [msg, setMsg] = useState(null)
    const [isAddLabel, setIsAddLabel] = useState(false)
    const [filterBy, setFilterBy] = useState({ task: '', labels: [] })
    const colors = ['lightgreen', 'lightyellow', 'lightblue', 'orange', 'slateblue', 'lightpink', 'lightgray', 'white']
    const isCloudLoader = useSelector(state => state.boardReducer.isCloudLoader)

    useEffect(async () => {
        setCloudImgs(currBoard.images)
        sendFilter()
    }, [filterBy])

    useEffect(() => {
        if (!boardMenuOp.isMenu) closeMenu()
    }, [boardMenuOp.isMenu])

    useEffect(() => {
        setLabels(currBoard.labels)
        setActivity(currBoard.activity)
    }, [currBoard])

    const onSearchTask = data => {
        setFilterBy({ ...filterBy, task: data.searchTask })
    }

    const onSearchLabel = idx => {
        if (filterBy.labels.includes(labels[idx].desc)) {
            const removeIdx = filterBy.labels.findIndex(label => label === labels[idx].desc)
            filterBy.labels.splice(removeIdx, 1)
            setFilterBy({ ...filterBy, labels: filterBy.labels })
        }
        else setFilterBy({ ...filterBy, labels: [...filterBy.labels, labels[idx].desc] })
    }

    const sendFilter = () => {
        boardMenuOp.filterTasks(filterBy)
    }

    const saveLabels = data => {
        var entries = Object.entries(data)
        entries = entries.filter(en => en[0] !== 'addBoardLabel' && en[0] !== 'addBoardLabelColor' && en[0] !== 'boardDesc' && en[0] !== 'searchTask')
        const labels = entries.map((label, idx) => {
            // if (!idx) return
            if (idx % 2 === 1) return { color: label[1] }
            return { desc: label[1] }
        })
        // labels.splice(0, 1)
        const arr = []
        labels.forEach((label, idx) => {
            if (idx % 2 === 0) arr.push({ _id: utilService.makeId(), desc: label.desc, color: labels[idx + 1].color })
        })
        setLabels(arr)
        dispatch(saveBoard({ ...currBoard, labels: arr }))
    }

    const onBoardDesc = data => {
        const descToUpdate = data.boardDesc.replace(/'|"/g, '\\"').replace(/\n/g, ' S1P2A3C4E5 ')
        dispatch(saveBoard({ ...currBoard, description: descToUpdate }))
    }

    const onAddBoardLabel = (data) => {
        const label = { _id: utilService.makeId(), desc: data.addBoardLabel, color: data.addBoardLabelColor }
        setLabels([...labels, label])
        currBoard.labels = [...labels, label]
        setIsAddLabel(!isAddLabel)
        dispatch(saveBoard(currBoard))
        // boardMenuOp.addActivity(user?user.username:'Guest', 'added', 'label')
    }

    const deleteLabel = (labelId) => {
        const idx = labels.findIndex(l => l._id === labelId)
        labels.splice(idx, 1)
        setLabels([...labels])
        currBoard.labels = labels
        dispatch(saveBoard(currBoard))
        // boardMenuOp.addActivity(user?user.username:'Guest', 'deleted', 'label')
    }

    const closeMenu = () => {
        boardMenuOp.setIsMenu(false)
        setIsAbout(false)
        setIsBackground(false)
        setIsFilter(false)
        setIsLabels(false)
        onSearchTask('')
        reset()
    }

    const onDeleteBoard = () => {
        if (!user) setMsg('Please login to delete this board')
        else if (user.username !== 'avivzo9' && user.username !== 'hadarMa' && user.username !== 'OshYok') setMsg('You are not authorized to delete this board. Only the creator of this board can delete it.')
        // else if (!user.admin) setMsg('You are not authorized to delete this board. Only the creator of this board can delete it.')
        else confirmAlert({
            title: 'Confirm to submit',
            message: 'Are you sure want to delete this board?',
            buttons: [
                {
                    label: 'Delete board',
                    onClick: () => boardMenuOp.deleteBoard()
                },
                {
                    label: 'Cancel'
                }
            ]
        });
    }

    if (!cloudImgs || !currBoard || !labels || !activity) return (<div className="board-menu-loader"><img src={loader} alt="" /></div>)
    currBoard.description = currBoard.description.replace(/ S1P2A3C4E5 /g, '\n')

    const tasksProgress = {
        inProgress: [],
        overdue: [],
        completed: []
    }

    const memberNameList = []
    const memberListIdx = currBoard.members.map((member) => {
        memberNameList.push(member.name)
        return 0
    })


    currBoard.cards.forEach(card => {
        card.tasks.forEach(task => {
            if (task.doneAt) tasksProgress.completed.push(task)
            else if (!task.dueDate) tasksProgress.inProgress.push(task)
            else task.dueDate > Date.now() ? tasksProgress.inProgress.push(task) : tasksProgress.overdue.push(task)
            task.members.forEach(m => {
                memberNameList.forEach((mem, idx) => {
                    if (m.name === mem) {
                        memberListIdx[idx]++
                    }
                })

            })
        })
    })

    const dataForMembersChart = {
        labels: memberNameList,
        datasets: [{
            label: 'Members',
            data: memberListIdx,
            backgroundColor: [
                'rgba(255, 99, 132, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(255, 205, 86, 0.7)',
                'rgba(201, 203, 207, 0.7)',
                'rgba(54, 162, 235, 0.7)'
            ],
            hoverOffset: 4
        }]
    };

    const dataForChart = {
        labels: ['Completed', 'In progress', 'Overdue'],
        datasets: [{
            label: 'Status',
            data: [tasksProgress.completed.length, tasksProgress.inProgress.length, tasksProgress.overdue.length],
            backgroundColor: [
                'rgba(29, 185, 84, 0.7)',
                'rgba(255, 159, 64, 0.7)',
                'rgba(255, 99, 132, 0.7)',
            ],
            borderColor: [
                'rgba(29, 185, 84)',
                'rgba(255, 159, 64)',
                'rgba(255, 99, 132)',
            ],
            borderWidth: 1,
        }]
    };

    return (
        <section className="board-menu flex" style={boardMenuOp.isMenu ? { maxWidth: 100 + '%' } : { maxWidth: 0 }}>
            <article className="menu-main">
                <div className="flex">
                    <h3>Menu</h3>
                    <p onClick={closeMenu} className="btn-close-icon"><FontAwesomeIcon className="fa" icon={faTimes} /></p>
                </div>
                <div className="flex">
                    <p onClick={() => setIsAbout(!isAbout)}>About & Statistics</p>
                    <p onClick={() => setIsBackground(!isBackground)}>Background</p>
                    <p onClick={() => setIsFilter(!isFilter)}>Search cards</p>
                    <p onClick={() => setIsLabels(!isLabels)}>Labels</p>
                </div>
                <div className="hide-overflow flex">
                    <h3>Activity</h3>
                    <ul>
                        {!activity.length ? null : activity.map(activity => <li key={activity._id}>
                            {(activity.type !== 'attached' && activity.type !== 'removed') ? <p><span>{activity.member}</span> {activity.type} {activity.desc} {activity.type === 'deleted' ? 'from' : 'to'} <span>{activity.card}</span>{activity.card === 'board' ? '' : ' card'}.</p>
                                : <p><span>{activity.member}</span> {activity.type} {activity.desc} {activity.type === 'removed' ? 'from' : 'to'} <span>{activity.card}</span> task.</p>}
                            <small><Moment fromNow>{activity.createdAt}</Moment></small>
                        </li>)}
                        {!activity.length && <li><h1>No activity here...</h1></li>}
                    </ul>
                </div>
            </article>
            <article className="menu-about sub-menu" style={isAbout ? { maxWidth: 100 + '%' } : { maxWidth: 0 }}>
                <div className="flex">
                    <p onClick={() => setIsAbout(!isAbout)} className="btn-close-icon"><FontAwesomeIcon className="fa" icon={faChevronLeft} /></p>
                    <h3>About & Statistics</h3>
                    <p onClick={closeMenu} className="btn-close-icon"><FontAwesomeIcon className="fa" icon={faTimes} /></p>
                </div>
                <div className="flex hide-overflow">
                    <div className="flex">
                        <h3>Members</h3>
                        <div>{boardMenuOp.members.map(member => <Avatar key={member._id} name={member.name} size="30" round={true} />)}</div>
                        <p>Total: {boardMenuOp.members.length}</p>
                    </div>
                    <div className="flex">
                        <h3>Description</h3>
                        <form onBlur={handleSubmit(onBoardDesc)}>
                            <textarea defaultValue={currBoard.description} {...register("boardDesc")} placeholder="It’s your board’s time to shine! Let people know what this board is used for and what they can expect to see." />
                        </form>
                    </div>
                    <div className="flex">
                        <h3>Statistics</h3>
                        <h4>Tasks per member</h4>
                        <PolarArea name="PolarArea" data={dataForMembersChart} />
                        <h4>Tasks status</h4>
                        <Bar height="200" data={dataForChart} />
                    </div>
                    <div className="flex">
                        <h3>Danger Zone</h3>
                        {msg && <h3 className="authMsg">{msg}</h3>}
                        <button onClick={onDeleteBoard}>Delete board</button>
                    </div>
                </div>
            </article>
            <article className="menu-background sub-menu" style={isBackground ? { maxWidth: 100 + '%' } : { maxWidth: 0 }}>
                <div className="flex">
                    <p onClick={() => setIsBackground(!isBackground)} className="btn-close-icon"><FontAwesomeIcon className="fa" icon={faChevronLeft} /></p>
                    <h3>Change background</h3>
                    <p onClick={closeMenu} className="btn-close-icon"><FontAwesomeIcon className="fa" icon={faTimes} /></p>
                </div>
                <div className="hide-overflow flex">
                    <div className="flex">
                        <h4>Colors</h4>
                        <div className="flex">
                            {colors.map((color, idx) => <aside key={idx} style={{ backgroundColor: color }} onClick={() => boardMenuOp.changeBackground(color, true)}></aside>)}
                        </div>
                    </div>
                    <div className="flex">
                        <h4>Photos</h4>
                        <div className="flex">
                            <Cloudinary txt={<div onClick={() => {
                                dispatch(updateIsCloudLoader(true))
                                setTimeout(() => {
                                    dispatch(updateIsCloudLoader(false))
                                }, 3000);
                            }} className='cloud-menu-btn'><p>Upload photo</p></div>} type="background" setCloudImgs={setCloudImgs} />
                            {cloudImgs.map((url, idx) => <img key={idx} onClick={() => boardMenuOp.changeBackground(url)} decoding="async" loading="lazy" src={url} alt={url} />)}
                        </div>
                    </div>
                </div>
            </article>
            <article className="menu-filter sub-menu" style={isFilter ? { maxWidth: 100 + '%' } : { maxWidth: 0 }}>
                <div className="flex">
                    <p onClick={() => setIsFilter(!isFilter)} className="btn-close-icon"><FontAwesomeIcon className="fa" icon={faChevronLeft} /></p>
                    <h3>Search cards</h3>
                    <p onClick={closeMenu} className="btn-close-icon"><FontAwesomeIcon className="fa" icon={faTimes} /></p>
                </div>
                <div>
                    <form onChange={handleSubmit(onSearchTask)}>
                        <input type="text" autoComplete="off" placeholder="Search for task..." {...register("searchTask")} />
                    </form>
                </div>
                <div>
                    <h4>Search by label</h4>
                    <ul>
                        {labels.map((label, idx) => <li key={idx} style={{ backgroundColor: filterBy.labels.includes(label.desc) ? 'gray' : 'inherit' }} onClick={() => onSearchLabel(idx)}>
                            <div style={{ backgroundColor: label.color }}></div>
                            <p>{label.desc}</p>
                        </li>)}
                    </ul>
                </div>
            </article>
            <article className="menu-labels sub-menu" style={isLabels ? { maxWidth: 100 + '%' } : { maxWidth: 0 }}>
                <div className="flex">
                    <p onClick={() => setIsLabels(!isLabels)} className="btn-close-icon"><FontAwesomeIcon className="fa" icon={faChevronLeft} /></p>
                    <h3>Labels</h3>
                    <p onClick={closeMenu} className="btn-close-icon"><FontAwesomeIcon className="fa" icon={faTimes} /></p>
                </div>
                <div className="hide-overflow">
                    <ul>
                        {labels.map((label, idx) => <li key={label._id} style={{ backgroundColor: label.color }}>
                            <form onChange={handleSubmit(utilService.debounce(saveLabels, 1000))}>
                                <input type="text" autoComplete="off" defaultValue={label.desc} placeholder="Label name" required {...register("editBoardLabel" + idx)} />
                                <label name="label-color"><FontAwesomeIcon className="fa" icon={faPalette} />
                                    <input type="color" autoComplete="off" {...register("editBoardLabelColor" + idx)} defaultValue={label.color} /></label>
                            </form>
                            <p><FontAwesomeIcon className="fa" icon={faTimes} onClick={() => deleteLabel(label._id)} /></p>
                        </li>)}
                        {!isAddLabel && <li onClick={() => setIsAddLabel(!isAddLabel)}><p>New label</p></li>}
                        {isAddLabel && <li>
                            <form onSubmit={handleSubmit(onAddBoardLabel)}>
                                <input type="text" placeholder="Label name" autoComplete="off" required {...register("addBoardLabel")} />
                                <input type="color" name="label-color" id="label-color" defaultValue="#FFFFFF" {...register("addBoardLabelColor")} />
                                <button>Add label</button>
                            </form>
                            <button onClick={() => setIsAddLabel(!isAddLabel)}>X</button>
                        </li>}
                    </ul>
                </div>
            </article>
        </section>
    )
}