import React, {useState} from 'react';

import {Field, Form} from 'react-final-form';
import {MuiFormPropsModel} from '../../models/mui-form-props.model';
import {useDispatch, useSelector} from 'react-redux';
import {RenderTextField} from '../Form/text-field';
import {RenderSelectField} from '../Form/select-field';
import {PreferenceType, WeekDaysOrDates} from '../../models/PreferenceType.enum';
import {Box, SxProps} from '@mui/system';
import {Button, MenuItem} from '@mui/material';
import {translations} from '../../services/translations';
import {ActionsTypes} from '../../store/types.actions';
import {LocationModel} from '../../models/Location.model';
import {locations} from '../../services/locations';
import {RenderFullNightField} from '../Form/full-night-field';
import {RenderFlexibilityField} from '../Form/flex-field';
import {PreferenceFields, PreferenceModel} from '../../models/Preference.model';
import {RenderSelectFieldDDays} from '../Form/select-field-days';
import {ShmiraListRecord} from '../../store/store.types';
import {Utils} from '../../services/utils';
import {Styles} from '../../hoc/themes';


const TRL = translations;


const getLabelByPreferenceType = (canOrCant: PreferenceType, weekDaysOrDates: WeekDaysOrDates): string => {
    let res = ''
    switch (canOrCant) {
        case PreferenceType.CanAlwaysGuard:
            return ''
        case PreferenceType.CanGuardIn:
            return weekDaysOrDates === WeekDaysOrDates.WeekDays ?
                translations.CanGuardInDays : translations.CantGuardInDaysDates

        case PreferenceType.CantGuardIn:
            return weekDaysOrDates === WeekDaysOrDates.WeekDays ?
                translations.CantGuardInDays : translations.CantGuardInDaysDates
        default:
            return ''
    }
    return res
}
const fieldWrapper: SxProps = {
    padding: '10px'
}
const selectFieldWrapper: SxProps = {
    ...fieldWrapper,
    paddingBottom: '0px'
}

const fieldWrapperText = {
    display: 'inline-flex',
    padding: '10px',
    maxWidth: '150px'
};
const allLocations: LocationModel[] = locations.map(o => ({...o}))
const preferenceFields: PreferenceModel = new PreferenceFields();

const Divider = () => (<Box sx={{
    width: '10px',
    height: '5px'
}}/>);

const daysOfWeekMenuItem = Utils.Date.dateOfWeekObject;

const createItemsFromDateRange = (dateFrom: string, dateTo: string): { dateInShort: string, timeStamp: string } [] => {


    const dateStampArr = Utils.Date.getTimestampArrayFromStartAndFinishDate(dateFrom, dateTo);
    return dateStampArr.map(n => {
            const simpleDate = Utils.Date.simpleDateFromDateStamp(n.toString())
            return ({
                dateInShort: simpleDate,
                timeStamp: n.toString(),
            })
        }
    )
}
const MaterialUiForm = (muiFormProps: MuiFormPropsModel) => {
    const {
        handleSubmit,
        pristine,
        reset,
        submitting,
        typeOfPreference,
        weekDaysOrDates
    } = muiFormProps;

    const shmiraListCollection: ShmiraListRecord[] = useSelector((state: { shmiraListCollection: ShmiraListRecord[] }) => state.shmiraListCollection);
    const shmiraListId: string = useSelector((state: { shmiraListId: string }) => state.shmiraListId);
    const currenList: ShmiraListRecord | undefined = shmiraListCollection.find(s => s.id === shmiraListId);
    let dateRange = createItemsFromDateRange('44444', '44480')
    if (currenList) {
        dateRange = createItemsFromDateRange(currenList.DateFrom, currenList.DateTo)

    }
    const [isAdvanced, setIsAdvanced] = useState(false);
    const handleSetAdvanced = (value: boolean = true) => {
        setIsAdvanced(value)
    }
    const advanceFieldWrapper: SxProps = {
        ...fieldWrapper,
        display: isAdvanced ? 'initial' : 'none'
    }

    return (

        <form onSubmit={(...args) => submitting(...args)} dir={'ltr'}>
            <Box id={'form-wrapper'} sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap'
            }}>


                <Box
                    sx={fieldWrapperText}
                >
                    <Field name={preferenceFields.guardName}
                           component={RenderTextField}
                           label={TRL.Name}
                    />
                </Box>
                <Box sx={selectFieldWrapper}>
                    <Field
                        label={TRL.TypeOfInfoPreference}
                        name={'TypeOfInfoPreference'}
                        component={RenderSelectField}>

                        <MenuItem value={PreferenceType.CanGuardIn.toString()}>{TRL.CanGuardIn}</MenuItem>
                        <MenuItem value={PreferenceType.CanAlwaysGuard.toString()}> {TRL.CanAlwaysGuard}</MenuItem>
                        <MenuItem value={PreferenceType.CantGuardIn.toString()}>{TRL.CantGuardIn}</MenuItem>

                    </Field>

                </Box>
                {typeOfPreference === PreferenceType.CanGuardIn || typeOfPreference === PreferenceType.CantGuardIn ?
                    <Box
                        sx={selectFieldWrapper}> <Field name={'weekDaysOrDates'}
                                                        component={RenderFlexibilityField}
                                                        label={TRL.flexibilityByDays}
                                                        rows={2}
                    />


                    </Box> : null}
                {(typeOfPreference === PreferenceType.CanGuardIn || typeOfPreference === PreferenceType.CantGuardIn) && weekDaysOrDates == WeekDaysOrDates.WeekDays ?
                    <Box sx={{
                        ...selectFieldWrapper,
                        minWidth: '20%'
                    }}>
                        <Field
                            name={'flexibilityByDays'}
                            component={RenderSelectFieldDDays}
                            label={getLabelByPreferenceType(typeOfPreference, WeekDaysOrDates.WeekDays)}


                        >
                            {daysOfWeekMenuItem.map((day: { name: string, weekDayNumber: number }) => {
                                return (<MenuItem key={day.weekDayNumber} value={day.weekDayNumber.toString()}>{day.name}</MenuItem>
                                )

                            })}
                        </Field>

                    </Box> : null}
                {(typeOfPreference === PreferenceType.CanGuardIn || typeOfPreference === PreferenceType.CantGuardIn) && weekDaysOrDates == WeekDaysOrDates.Dates ?
                    <Box sx={{
                        ...selectFieldWrapper,
                        minWidth: '30%'
                    }}>
                        <Field
                            name={'flexibilityByDates'}
                            component={RenderSelectFieldDDays}
                            label={getLabelByPreferenceType(typeOfPreference, WeekDaysOrDates.Dates)}


                        >
                            {dateRange.map((day: { dateInShort: string, timeStamp: string }) => {
                                return (<MenuItem key={day.dateInShort} value={day.timeStamp.toString()}>{day.dateInShort}</MenuItem>
                                )

                            })}
                        </Field>

                    </Box> : null}

                <Box sx={{
                    ...
                        Styles
                            .flexRow,
                    flexWrap: 'wrap',
                    mt: '0.5em'
                }}>
                    <Box
                        sx={fieldWrapper}> <Field name={preferenceFields.Comments}
                                                  component={RenderTextField}
                                                  label={TRL.Comments}
                        // multiLine={true}
                                                  rows={2}
                    />
                    </Box>
                    <Box
                        sx={{
                            ...fieldWrapper,
                            //alignSelf: 'flex-end',
                            //minWidth: '80%'
                        }}> <Field name={preferenceFields.halfOrFull}
                                   component={RenderFullNightField}
                                   label={TRL.halfOrFull}
                                   type={'text'}
                                   rows={2}
                    />


                    </Box>

                    <Box sx={{
                        ...fieldWrapper,
                        display: 'flex',
                        flexDirection: 'row',
                        alignSelf: 'flex-end'
                    }}
                    >

                        <Button sx={{
                            alignSelf: 'flex-end',
                            justifySelf: 'end',
                            m: '5px',
                            width: '90px'
                        }} variant="contained" color={'primary'} type="button"
                                onClick={handleSubmit}>{TRL.Submit}</Button>


                    </Box>

                </Box>


            </Box>
        </form>
    );
};

export const PreferenceRequestForm = (formProps: MuiFormPropsModel) => {

    const dispatch = useDispatch();

    const id = formProps.preferenceId;
    const preferences = useSelector((state: { preferences: PreferenceModel[] }) => state.preferences);


    const initialValues = preferences.find(preference => preference.id === id);
    // @ts-ignore
    const [_typeOfPreference, set_typeOfPreference] = useState<PreferenceType | undefined>(initialValues.TypeOfInfoPreference as PreferenceType);
    const [_weekDaysOrDays, set_weekDaysOrDays] = useState<WeekDaysOrDates | undefined>(initialValues?.weekDaysOrDates as WeekDaysOrDates);
    let formValues = {...initialValues};


    return (
        <Form
            initialValues={initialValues}
            onSubmit={(values: any) => {
            }}
            validate={(values: any) => {

                if (!formProps.isInEdit) {
                    return
                }
                dispatch({
                    type: ActionsTypes.UPDATE_ORDER_IN_EDIT,
                    payload: {
                        ...values
                    }
                })
                if (values?.TypeOfInfoPreference && values?.TypeOfInfoPreference !== _typeOfPreference) {
                    set_typeOfPreference(values.TypeOfInfoPreference)
                }
                if (values?.weekDaysOrDates && values?.weekDaysOrDates !== _weekDaysOrDays) {
                    set_weekDaysOrDays(values.weekDaysOrDates)
                }
                return {}
            }}
            handleSubmit={(event: Event, values: any) => {
                if (!formProps.isInEdit) {
                    return
                }
                dispatch({
                    type: ActionsTypes.UPDATE_ORDER,
                    payload: {
                        id: id
                    }
                })

            }}
            render={({handleSubmit}: any) => (MaterialUiForm({
                ...formProps,
                typeOfPreference: _typeOfPreference,
                weekDaysOrDates: _weekDaysOrDays,
                handleSubmit,
            }))

            }/>
    )
}


