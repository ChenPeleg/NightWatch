import React from 'react'
import {Box} from '@mui/system';
import {useSelector} from 'react-redux';
import {Typography} from '@mui/material';
import {translations} from '../../services/translations';

import {ShmiraListRecord, ShmiraListStore} from '../../store/store.types';
import {SketchPendingPreference} from './SketchPendingOrder';
import {PreferenceModel} from '../../models/Preference.model';
import {SketchModel} from '../../models/Sketch.model';
import {RangeModel} from '../../shmiraListBuilder/models/shmiraList.models';


interface sketchPendingPreferencesProps {
    pendingPreferences: PreferenceModel[],
}


export const SketchPendingPreferences = (props: sketchPendingPreferencesProps) => {

    const pendingPreferenceInEdit = useSelector((state: ShmiraListStore) => state.pendingPreferenceIdInEdit);
    const shmiraListCollection = useSelector((state: { shmiraListCollection: ShmiraListRecord [] }) => state.shmiraListCollection);

    const ShmiraIdInEdit = useSelector((state: { shmiraListId: string }) => state.shmiraListId);
    const shmiralListInEdit = shmiraListCollection.find(s => s.id === ShmiraIdInEdit) as ShmiraListRecord;
    const Range: RangeModel = {
        DateFrom: shmiralListInEdit.DateFrom,
        DateTo: shmiralListInEdit.DateTo
    }

    const SketchIdInEdit = useSelector((state: ShmiraListStore) => state.SketchIdInEdit);
    const sketches: SketchModel[] = useSelector((state: { sketches: SketchModel[] }) => state.sketches);
    const sketchInEdit: SketchModel = sketches.find(s => s.id === SketchIdInEdit) as SketchModel;
    const unassingedPreferences = sketchInEdit.unassignedPreferences;
    return (<Box id={'pending-preference-container'} sx={{
            direction: 'ltr',
            m: '0.2em',
            mb: '0.3em',
            minHeight: '10vh',
            minWidth: '20vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'start',
        }}>
            <Typography variant={'h6'}> {translations.GuardsNoAssigned} </Typography>

            {(unassingedPreferences || []).map((preference: PreferenceModel) => {
                return <SketchPendingPreference Range={Range} isInEdit={pendingPreferenceInEdit === preference.id} key={preference.id}
                                                preference={preference}/>
            })}
        </Box>

    )

}
