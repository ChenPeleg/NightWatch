import React, {useState} from 'react'
import {Box} from '@mui/system';
import {useDispatch, useSelector} from 'react-redux';
import {Card, Typography, Zoom} from '@mui/material';
import {ExtendedPreferenceModel, NightScheduleModel, SketchModel} from '../../models/Sketch.model';
import {locations} from '../../services/locations';
import {LanguageUtilities} from '../../services/language-utilities';
import {Utils} from '../../services/utils';
import {translations} from '../../services/translations';
import {LightTooltip} from '../Styled/styled-tool-tip';
import {PreferenceModel} from '../../models/Preference.model';
import {ShmiraListStore} from '../../store/store.types';


interface nightsProps {

    night: NightScheduleModel
    sketchDriveClick: (event: React.MouseEvent<HTMLElement>, drive: any) => void
}


const timeText = (drive: ExtendedPreferenceModel) => LanguageUtilities.buildBriefText(drive, locations).timeText;
const driverAndLocation = (drive: ExtendedPreferenceModel) => LanguageUtilities.buildBriefText(drive, locations).driverAndLocation;

function ArrowUpwardIcon() {
    return null;
}


export const SketchNight = (props: nightsProps) => {
    const dispatch = useDispatch();
    const SketchIdInEdit = useSelector((state: ShmiraListStore) => state.SketchIdInEdit);
    const sketches: SketchModel[] = useSelector((state: { sketches: SketchModel[] }) => state.sketches);
    const sketchInEdit: SketchModel = sketches.find(s => s.id === SketchIdInEdit) as SketchModel;

    const night = props.night;// sketchInEdit.NightSchedule.find(n => n.id === props.night.id) as NightScheduleModel;
    const preferences = useSelector((state: { preferences: PreferenceModel[] }) => state.preferences);

    const [inHover, setInHover] = useState(false);
    const onMouseOver = () => {
        setInHover(true)
    };
    const onMouseOut = () => {
        setInHover(false)
    };

    const nightDateText = Utils.Date.simpleDateFromDateStamp(night.date)
    const dayOfWeek = Utils.Date.getDatOfWeekTextFromTimeStamp(night.date);
    const optionalGuardsArr = preferences.filter(g => night.optionalGuards.includes(g.id)).map(g => g.guardName);
    const guardsRaw: (PreferenceModel | undefined)[] = night.guards.map(guardId => preferences.find(p => p.id === guardId))
    const guardNames = guardsRaw.map(g => g && g.guardName ? g.guardName : null).filter(g => g)
    const isMissing = guardNames.length < 2;
    return (

        <Box>
            <LightTooltip placement={'left'} TransitionComponent={Zoom}
                          title={translations.peopleWhoCanGuard + ': ' + optionalGuardsArr.join(', ')}>
                <Card onClick={(event: any) => props.sketchDriveClick(event, night)} onMouseOver={onMouseOver}
                      onMouseOut={onMouseOut} elevation={inHover ? 8 : 2} sx={{
                    m: '0.0em',
                    mb: '0.1em',
                    position: 'relative',
                    zIndex: 40,
                    minHeight: '3vh',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'stretch',
                    justifyContent: 'start',
                    cursor: 'default'
                }}>
                    <Box id={'night-date'} sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'start',
                        justifyContent: 'start',
                        flexWrap: 'wrap',
                        p: '0.2em',
                        pl: '0.25em',
                        pr: '0.25em',
                        bgcolor: '#aadcff',
                        //flexShrink: 4,
                        minWidth: '80px',
                        minHeight: '100%',
                        //flexShrink: '4'

                    }}>
                        <Typography dir="ltr"
                                    variant={'subtitle1'}>{nightDateText} {dayOfWeek} </Typography>


                    </Box>

                    <Box id={'night-description'} sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'start',
                        justifyContent: 'start',
                        p: '0.2em',
                        pl: '0.4em',
                        pr: '0.4em',
                        flexGrow: 4,
                        minWidth: '120px',

                    }}>
                        <Box sx={{
                            width: '5px',
                            height: '10px'
                        }}/>
                        <Typography
                            variant={'subtitle1'}>{guardNames.join(', ')}  </Typography>
                        <Box sx={{
                            width: '5px',
                            height: '10px'
                        }}/>
                        {isMissing ? <Typography color={'red'} fontWeight={'bold'}
                                                 variant={'subtitle1'}>{' ' + translations.missingGuard + ' '}  </Typography> : null}
                    </Box>
                </Card>
            </LightTooltip>
        </Box>


    )

}
