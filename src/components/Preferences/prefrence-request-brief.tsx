import React from 'react';
import {useSelector} from 'react-redux';
import {Box, SxProps, Theme} from '@mui/system';
import {Typography} from '@mui/material';
import {translations} from '../../services/translations';
import {LanguageUtilities} from '../../services/language-utilities';
import {LocationModel} from '../../models/Location.model';
import {locations} from '../../services/locations';
import {PreferenceType} from '../../models/PreferenceType.enum';
import {PreferenceFields, PreferenceModel} from '../../models/Preference.model';


//const TRL = translations;

type AppProps = {
    preferenceId: string;
    sx: SxProps,
    isInEdit: boolean
};
const allLocations: LocationModel[] = locations.map(o => ({...o}))
const useStyles: any = (() => ({
    root: {
        direction: (theme: Theme) => theme.direction,
        '& .MuiFormLabel-root': {
            left: 'inherit'
        }
    },
    fieldWrapper: {
        display: 'inline-flex',
        padding: '10px'
    },
    fieldWrapperText: {
        display: 'inline-flex',
        padding: '10px',
        maxWidth: '150px'
    },
    cardBase: {
        direction: (theme: Theme) => theme.direction,
        padding: '10px',
        cursor: 'pointer',
        width: '90%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'

    },
    additionalText: {
        fontSize: '14px'
    }
}))
const preferenceFields: PreferenceModel = new PreferenceFields();

const areDetailsMissing = (preferenceValues: PreferenceModel): boolean => {
    if (!preferenceValues.TypeOfDrivePreference || !preferenceValues.guardName || !preferenceValues.optionalGuardDaysByDates) {
        return true
    }
    if (preferenceValues.TypeOfDrivePreference === PreferenceType.CanGuardIn) {
        if (!preferenceValues.finishHour || !preferenceValues.optionalGuardDaysByDates) {
            return true
        }
    }
    return false
}

const buildBriefText = (preferenceValues: PreferenceModel): string => {
    const isWithName = preferenceValues.guardName.trim() !== '';
    if (!isWithName) {
        return translations.NewPreference
    }
    let timeText = preferenceValues?.optionalGuardDaysByDates || '';
    if (preferenceValues.TypeOfDrivePreference === PreferenceType.CanGuardIn && preferenceValues?.optionalGuardDaysByDates && preferenceValues?.finishHour) {
        timeText = preferenceValues.finishHour + ' - ' + preferenceValues.optionalGuardDaysByDates;
    }
    let briefText = timeText + ' ' + preferenceValues.guardName;
    if (preferenceValues.TypeOfDrivePreference && preferenceValues.location) {
        const driveTimeLanguage = LanguageUtilities.getPrefixByDriveType(preferenceValues.TypeOfDrivePreference);
        const location = allLocations.find(l => l.id === preferenceValues.location);
        if (location) {
            briefText += ' ' + driveTimeLanguage.location + location.name
        }

    }

    return briefText
}
export const PrefrenceRequestBrief = (props: AppProps) => {
    const id = props.preferenceId;
    const preferenceValues = useSelector((state: { preferences: PreferenceModel[] }) => {
        return state.preferences.find(preference => preference.id === id) as PreferenceModel;
    });
    const missingDetailsShown: boolean = areDetailsMissing(preferenceValues) && !props.isInEdit;


    return (
        <Box sx={{
            padding: '5px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'start',
            alignItems: 'start'
        }}>
            <Typography fontWeight={props.isInEdit ? 'bold' : 'initial'} fontSize={'large'} padding={'initial'}>
                {buildBriefText(preferenceValues)}
            </Typography>
            <Typography fontSize={'large'} color={'red'} padding={'initial'}>  &nbsp;
                {missingDetailsShown ? ' (' + translations.missingDetails + ') ' : null}
            </Typography>

        </Box>


    )
}

