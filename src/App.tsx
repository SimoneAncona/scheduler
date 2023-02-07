import { useState } from 'react'
import axios from "axios"
import './App.css'
import Scheduler from './components/Scheduler'
import { PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, CELL_ACCENT_COLOR, CELL_PRIMARY_COLOR, CELL_SECONDATY_COLOR, HTTP_URL, TEACHER_REQ, COURSE_REQ } from './Settings'
import { Subject, Teacher } from './Interfaces'

type HourData = {
  day      : number
  fromHour : number
  toHour   : number
  teachers : Teacher[]
  subject  : Subject
}


function App() {
  const data = new Array<HourData>()
  data.push(
    {
      day: 1,
      fromHour: 0,
      toHour: 1,
      teachers: [],
      subject: {
        Name : "Ginnastica"
      }
    }
  )

  axios.post(HTTP_URL, {
    name : TEACHER_REQ,
    argv : [1, "2023-01-12"]
  }).then( data => console.log(data) )

  axios.post(HTTP_URL, {
    name : COURSE_REQ,
    argv : [1, "AT", "2023-01-12"]
  }).then( data => console.log(data) )

  return (
    <Scheduler 
      height={"100%"}
      width={"100%"}
      data={data}
      hourTabWidth={'15%'}    
      dayTabHeight={'10%'}
      accent_color={ACCENT_COLOR}
      primary_color={PRIMARY_COLOR}
      secondary_color={SECONDARY_COLOR}
      cellProps={{
        text_color: CELL_ACCENT_COLOR,
        primary_color: CELL_PRIMARY_COLOR,
        secondary_color: CELL_SECONDATY_COLOR
      }}
      timeSettings={{
        hourLenght: '1:00',
        fromHour: "8:00",
        toHour: "17:00"
      }}
    />
  )
}

export default App
