import {hashFunction} from './hash-function';
import {ExtendedPreferenceModel, NightScheduleModel, SketchModel} from '../models/Sketch.model';
import {PreferenceType} from '../models/PreferenceType.enum';

const ExcelDifferenece = 25569.0;
export const Utils = {
    getNextId: (currentIds: string[]): string => {
        const allIds: number [] = currentIds.map(id => Number(id));
        allIds.push(0)
        const newId = Math.max(...allIds) + 1;
        return newId.toString()
    },
    validateHash: (data: string, hash: string): boolean => {
        return (data && hash) ? hashFunction(data).toString() === hash : false
    },
    convertStrToNum: (str: string): number => {
        let numberToReturn = 0
        try {
            const parsed = parseInt(str, 10)
            if (!isNaN(parsed)) {
                numberToReturn = parsed;
            }
        } catch (e) {

        } finally {

        }
        return numberToReturn

    },
    defaultSketchMMock(): SketchModel {
        let ids: number = 1
        const mkDrv = (driver: string, start: string, finish: string, location: string, TypeOfInfoPreference: PreferenceType = PreferenceType.CanGuardIn): ExtendedPreferenceModel => {
            ids++
            return {
                id: ids.toString(),
                guardName: driver,
                optionalGuardDaysByDates: start,
                finishHour: finish,
                TypeOfInfoPreference: TypeOfInfoPreference,
                location: '1',
                Comments: '',
                halfOrFull: '1',
                flexibilityByDays: [],
                flexibilityByDates: [],
                implementsPreferences: [],
                description: '',
                weekDaysOrDates: null
            }

        }
        const vehicle1: NightScheduleModel = {
            id: '1',
            date: '1',
            drivesToRemove: [
                mkDrv('יוסי', '08:00', '10:00', '1'),
                mkDrv('חן', '11:00', '14:00', '1'),
                mkDrv('אברהם', '16:00', '20:00', '1'),
                mkDrv('רונה', '20:30', '20:00', '1'),
            ],
            Comments: 'רכב ראשון',
            guards: [],
            optionalGuards: [],
        }
        const vehicle2: NightScheduleModel = {
            id: '2',
            date: '1',
            drivesToRemove: [
                mkDrv('יוליה', '06:00', '12:00', '1'),
                mkDrv('רונן', '12:30', '14:00', '1'),
                mkDrv('שמואל', '15:00', '19:00', '1'),
                mkDrv('מיכל', '20:00', '23:00', '1'),
            ],
            guards: [],
            optionalGuards: [],
            Comments: 'רכב ראשון'
        }
        return {
            NightSchedule: [vehicle1, vehicle2],
            id: '1',
            Comments: '',
            name: 'סידור בשני רכבים',
            unassignedPreferences: [],
            assignedPreferences: [],
        }
    },
    hourTextToDecimal(hourText: string): number {
        if (!hourText.includes(':')) {

        }
        const splitHour = hourText.split(':');
        const hour = Number(splitHour[0]) || 0;
        const minutes = Number(splitHour[1]) || 0;
        const minutesAsFraction = this.minutesToFraction(minutes);
        return hour + minutesAsFraction;


    },
    DecimalTimeToHourText(time: number): string {
        if (time !== 0 && !time) {
            return ''
        }
        const numberToTwoDigit = (num: number): string => {
            if (!num) {
                num = 0;
            }
            let addZero = ''
            if (num < 10) {
                addZero = '0'
            }
            return addZero + num.toString()
        }
        const correctSmallDiversions = (num: number): number => {
            if (!num) {
                return num
            }
            const remainder = num % 5
            if (remainder === 0) {
                return num
            }
            if (remainder && remainder > 2.5) {
                return num + (5 - remainder);
            } else {
                return num - remainder;
            }

        }
        time += 0.02;
        const hour = Math.floor(time);
        const minutesAsFraction = Math.floor(100 * (time - Math.floor(time)));
        const minutes = this.FractionToMinutes(minutesAsFraction);
        const minutesCorrected = correctSmallDiversions(minutes);
        const hourText = numberToTwoDigit(hour)
        const minuteText = numberToTwoDigit(minutesCorrected)
        return hourText + ':' + minuteText;


    },
    minutesToFraction(minute: string | number): number {
        const minAsNumber = Number(minute) || 0;
        if (minAsNumber == 0) {
            return 0
        }
        return Math.floor((minAsNumber / 60) * 100) / 100
    },
    FractionToMinutes(minute: number): number {
        const minAsNumber = Number(minute) || 0;
        if (minAsNumber == 0) {
            return 0
        }
        return Math.floor((minAsNumber / 100) * 60)
    },
    Date: {
        // dateToTimeStamp(inDate: Date): string {
        //
        //     const returnDateTime = ((inDate.getTime() - 1) / (1000 * 60 * 60 * 24));
        //     return returnDateTime.toString();
        // },

        // excelDateToJSDate(orgExcelDate: string | number): Date {
        //     const excelDate = Number(orgExcelDate) | 0
        //     const date = new Date(Math.round((excelDate - (25567 + 1)) * 86400 * 1000));
        //     const converted_date = date.toISOString().split('T')[0];
        //     return date;
        // },
        dateStampToDate(dateStamp: string): Date | null {
            if (!dateStamp) {
                return null;
            }

            let result = new Date(1900, 0, 1);
            result.setDate(result.getDate() + Number.parseInt(dateStamp));

            return result;
        },
        dateToDateStamp(date: Date): string {
            if (!date) {
                return '';
            }

            let startDate = new Date('1900-01-01');
            let resultDate = new Date(date);
            let x = new Date();
            var offset = (x.getTimezoneOffset() * 60 * 1000);

            const milisecondsInDay = (24 * 60 * 60 * 1000);
            let dateStamp = Math.floor((resultDate.getTime() - resultDate.getTimezoneOffset() * 60 * 1000) / milisecondsInDay) -
                Math.round((startDate.getTime() - startDate.getTimezoneOffset()) / milisecondsInDay);

            return dateStamp.toString();
        },
        simpleDateFromDateStamp(dateStamp: string): string {
            const date: Date | null = this.dateStampToDate(dateStamp)

            if (date) {
                return date.getDate().toString() + '.' + (date.getMonth() + 1).toString()
            } else {
                return ''
            }

        },
        getTimestampArrayFromStartAndFinishDate(dateFrom: string, dateTo: string): string [] {
            const numberOfDays: number = Number(dateTo) - Number(dateFrom) + 1;
            const correctedNumberOfDays = numberOfDays < 100 && numberOfDays > 10 ? numberOfDays : 40
            const plainNumbersArray = Array.from(Array(correctedNumberOfDays).keys())
            const dateStampArr = plainNumbersArray.map(d => d + Number(dateFrom))

            return dateStampArr.map(d => d.toString())


        },
        getWeekDayNumberFromTimeStamps(timeStamps: string[]): { timeStamp: string, dayNumber: number }[] {
            return timeStamps.map((t: string) => {
                const date: Date = this.dateStampToDate(t) || new Date();

                return {
                    timeStamp: t,
                    dayNumber: date.getDay() + 1
                }

            })
        },
        getDatOfWeekTextFromTimeStamp(timeStamps: string): string {
            const date: Date = this.dateStampToDate(timeStamps) || new Date();

            const dayNumber = date.getDay() + 1
            return this.dateOfWeekObject.find(d => d.weekDayNumber === dayNumber)?.name || ''

        },
        get dateOfWeekObject() {
            return [
                {    name: 'Sunday',
                    weekDayNumber: 1
                },
                {
                    name: 'Monday',
                    weekDayNumber: 2
                },
                {
                    name: 'Tuesday',
                    weekDayNumber: 3
                },
                {
                    name: 'Wednesday',
                    weekDayNumber: 4
                },
                {
                    name: 'Thursday',
                    weekDayNumber: 5
                },
                {
                    name: 'Friday',
                    weekDayNumber: 6
                },
                {
                    name: 'Saturday',
                    weekDayNumber: 7
                },
            ]
        }


    }

}
