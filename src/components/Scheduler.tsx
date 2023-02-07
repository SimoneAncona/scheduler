import { useState } from "react"
import Style from "./Scheduler.module.css"
import { Subject, Teacher } from "../Interfaces"

type HEXColorString  = string
type RGBColorString  = string | [ number, number, number ]
type RGBAColorString = string | [ number, number, number, number ]

type HourData = {
    day      : number
    fromHour : number
    toHour   : number
    teachers : Teacher[]
    subject  : Subject
}

type TimeSettings = {
    hourLenght : string
    fromHour   : string
    toHour     : string
}

type CellProps = {
    text_color      : RGBColorString | RGBAColorString | HEXColorString
    primary_color   : RGBColorString | RGBAColorString | HEXColorString
    secondary_color : RGBColorString | RGBAColorString | HEXColorString
}

type Props = {
    height ?: number | string
    width  ?: number | string
    data    : Array<HourData>
    dayTabHeight    : number | string
    hourTabWidth    : number | string
    accent_color    : RGBColorString | RGBAColorString | HEXColorString
    primary_color   : RGBColorString | RGBAColorString | HEXColorString
    secondary_color : RGBColorString | RGBAColorString | HEXColorString
    
    cellProps    : CellProps

    timeSettings : TimeSettings
}



const FALLBACK_UNIT_TYPE = "px",
      EVER               = true,
      SPAN_BORDER_SIZE   = 2,
      CELL_BORDER_SIZE   = 1,
      HOUR_FORMATTER     = Intl.NumberFormat(undefined, {minimumIntegerDigits : 2})

const TODAY         = new Date(),
      CURRENT_WEEK  = new Date(),
      MONDAY_OFFSET = 1,
      DAYS          = [
          "Lunedì",
          "Martedì",
          "Mercoledì",
          "Giovedì",
          "Venerdì"
      ]

CURRENT_WEEK.setHours(0)
CURRENT_WEEK.setMilliseconds(0)
CURRENT_WEEK.setSeconds(0)
CURRENT_WEEK.setMinutes(0)
CURRENT_WEEK.setDate( CURRENT_WEEK.getDate() - CURRENT_WEEK.getDay() )



const extractColor : ( color : RGBColorString | RGBAColorString | HEXColorString ) => string = color => 
    ( typeof color === "string" ) 
        ? color 
        : color.length === 3 
            ? `rgb(${color.join(", ")})` 
            : `rgba(${color.join(", ")})`

const extractMaybeProp : ( prop : undefined | number | string ) => string = prop =>
    ( prop === undefined ) 
        ? "100%"
        : ( typeof prop === "string" )
            ? prop
            : `${prop}${FALLBACK_UNIT_TYPE}`



const DayView = ({ currentWeek, height, width, accent_color, accent_text_color } : { currentWeek : Date, height : string, width : string, accent_color : string, accent_text_color : string  } ) => {
    
    let temp_data = new Date(currentWeek)
    temp_data.setDate(temp_data.getDate() + 1)

    const getDataAndIncrement = () => {
        let ret = temp_data.getDate();
        temp_data.setDate(temp_data.getDate() + 1)
        return ret
    }

    const getSpan = ( day : number, month : number ) => {
        const IS_TODAY =  TODAY.getDate()  === day 
                       && TODAY.getMonth() === month
        
        return (
            <span style={ 
                IS_TODAY ? {
                    backgroundColor : accent_color,
                    color           : accent_text_color,
                    border          : `${SPAN_BORDER_SIZE}px solid ${accent_color}`
                } : {
                    border          : `${SPAN_BORDER_SIZE}px solid ${accent_color}`
                } 
            }>
                {day}/{month + 1}
            </span>
        )
    }

    return (
    <div className={Style.schedulerDayContainer} style={{width}}>
        {DAYS.map( el => (
            <div className={Style.schedulerDay} key={el}>
                <div>
                    {getSpan(getDataAndIncrement(),temp_data.getMonth())}
                </div>
                <div>
                    <p>{el}</p>
                </div>
            </div>
        ))}
    </div>
)}

const getIntegerFromTime = ( time : string ) => 
    time.split(":")
        .reduce((acc, val, index) => acc + Number(val) * ( 60 ** ( 1 - index ) ), 0)

const getTimeFromInteger = ( integer : number ) =>
    `${ ~~( integer / 60 ) }:${ HOUR_FORMATTER.format( integer % 60 ) }`

const HourDisplay = ({ timeSettings, hourTabWidth, numberOfModules } : { timeSettings : TimeSettings, hourTabWidth : number | string, numberOfModules : number }) => {

    function* moduleGenerator() {
        const IncrementValue = getIntegerFromTime(timeSettings.hourLenght),
              StartValue     = getIntegerFromTime(timeSettings.fromHour)
        let i = 0
        for(;EVER;) yield getTimeFromInteger( StartValue + (IncrementValue * ++i) )
    }

    let getHour = moduleGenerator()
    let modules = new Array<string>()
    for(let i = 0; i < numberOfModules - 1; i++) modules.push(getHour.next().value as string)
    return (
        <div className={Style.hourDisplayContainer} style={{ width : hourTabWidth }}>
            {modules.map( mod => ( 
            <div key={mod} className={Style.hourDisplay}>
                <p className={Style.hourLabel}
                    style={{ transform : `translate(0, calc(${CELL_BORDER_SIZE / 2}px + var(--hour-display-font-size)/2))`}}
                >{mod}</p>
            </div>
            ))}
            <div className={Style.hourDisplay}></div>
        </div>
    )
}

const HourGridDisplay = ({ data, totalHeight, dayTabHeight, cellProps, borderColor, numberOfModules, popUpCol, width } : { data : HourData[], popUpCol : string, totalHeight : string, cellProps : CellProps, numberOfModules : number, dayTabHeight : string, width : string, borderColor: string }) => {
    
    const CELL_PRIMARY_COL   = extractColor(cellProps.primary_color   ),
          CELL_SECONDARY_COL = extractColor(cellProps.secondary_color ),
          CELL_TEXT_COL      = extractColor(cellProps.text_color      )

    let actual_data = new Array<HourData>()
    let foundFlag = false;
    data.forEach( el => { 
        for( let elem of actual_data ) {
            if (   elem.day      == el.day 
                && elem.fromHour == el.fromHour
                && elem.toHour   == el.toHour
                && elem.subject  == el.subject
            ) elem.teachers.push( ...el.teachers )
            else {
                foundFlag = true
                actual_data.push( el )
            }
        }
        if(!foundFlag)actual_data.push( el )
        foundFlag = false
    })
    console.log(actual_data)
    const getItemForCell = (index : number) => {

        const [ showPopUp, setShowPopUp ] = useState(false),
              DAY  = index % 5,
              HOUR = ~~ ( index / 5 ),
              DATA = actual_data.find( hour => (hour.day - MONDAY_OFFSET) === DAY && hour.fromHour === HOUR )

        return DATA === undefined ? (
            <div className={Style.HourGridCellData} />
        ) : (
            <div className={Style.HourGridCellDataWrap}>
                <div 
                    className={Style.HourGridCellData} 
                    style={{
                        backgroundColor : CELL_PRIMARY_COL,
                        color           : CELL_TEXT_COL,
                    }} 
                    onMouseOver = { ev => ev.currentTarget.style.backgroundColor = CELL_SECONDARY_COL }
                    onMouseOut  = { ev => ev.currentTarget.style.backgroundColor = CELL_PRIMARY_COL   }
                    onClick     = { ev => setShowPopUp(true) }
                >
                    <p>{ DATA.subject.Name }</p>
                </div>
                <div 
                    className={Style.popUpWrapper}
                    style={{
                        display : showPopUp ? "grid" : "none", 
                        backgroundColor : popUpCol,
                        width   : `calc(${width} / ${DAYS.length} - 2px)`,
                        height  : `calc( calc(${totalHeight} - ${dayTabHeight}) / ${numberOfModules})`
                    }}
                >
                    ds
                </div>
            </div>
        )
    }

    return (
        <div className={Style.HourGridContainer} style={{
            width,
            gridTemplateColumns : `1fr `.repeat(DAYS.length),
            gridTemplateRows    : `1fr `.repeat(numberOfModules)
        }}>
            {new Array( numberOfModules * DAYS.length ).fill(undefined).map( ( el, index ) => (
                <div className={Style.HourGridCell} key={index} style={{
                    border     : `${CELL_BORDER_SIZE}px solid ${borderColor}`,
                    borderTop  : !(~~(index/DAYS.length)) ? `${CELL_BORDER_SIZE}px solid ${borderColor}` : "0",
                    borderLeft : !(index%DAYS.length)     ? `${CELL_BORDER_SIZE}px solid ${borderColor}` : "0"
                }}>
                    {getItemForCell(index)}
                </div>
            ))}
        </div>
    )
}

export default ({height, width, hourTabWidth, dayTabHeight, data, accent_color, primary_color, secondary_color, cellProps, timeSettings} : Props) => {

    const [week, setWeek] = useState(CURRENT_WEEK),
          actualH      = extractMaybeProp( height ),
          actualW      = extractMaybeProp( width  ),
          actualAccCol = extractColor( accent_color    ),
          actualPriCol = extractColor( primary_color   ),
          actualSecCol = extractColor( secondary_color ),
          NUMBER_OF_MODULES = ( getIntegerFromTime(timeSettings.toHour)
                            - getIntegerFromTime(timeSettings.fromHour) )
                            / getIntegerFromTime(timeSettings.hourLenght)
    
    return (
    <div 
        className={Style.schedulerWrap}
        style={{
            height : actualH,
            width  : actualW,
            backgroundColor : actualPriCol
        }}
    >
        <div className={Style.topWrap}>
            <div className={Style.empty} style={{width:hourTabWidth, height:"100%"}}/>
            <DayView 
                currentWeek={week} 
                height={ typeof dayTabHeight === "number" ? `${dayTabHeight}px` : dayTabHeight } 
                width={`calc(100% - ${hourTabWidth})`}
                accent_color={actualAccCol}
                accent_text_color={actualPriCol}
            />
        </div>
        <div className={Style.bottomWrap}>
            <HourDisplay hourTabWidth={hourTabWidth} timeSettings={timeSettings} numberOfModules={NUMBER_OF_MODULES}/>
            <HourGridDisplay 
                dayTabHeight={typeof dayTabHeight === "number" ? `${dayTabHeight}px` : dayTabHeight} 
                borderColor={actualSecCol} 
                popUpCol={actualPriCol}
                data={data} 
                cellProps={cellProps} 
                numberOfModules={NUMBER_OF_MODULES}
                totalHeight={actualH} 
                width={`calc(100% - ${hourTabWidth})`}
            />
        </div>
        
    </div>
    )
}