import React, {useState} from 'react'
import {Box} from '@mui/system';
import {useDispatch, useSelector} from 'react-redux';
import {Button, Select, SelectChangeEvent, Typography} from '@mui/material';
import {translations} from '../../services/translations';
import {SketchModel} from '../../models/Sketch.model';
import {ActionsTypes} from '../../store/types.actions';
import {ShmiraListRecord, ShmiraListStore} from '../../store/store.types';
import {SketchActionType} from '../../models/SketchMenuClickActionType.enum';
import {SketchMenu} from './sketch-menu';
import {Edit, GridOn} from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import {Sketch} from './Sketch';
import MenuItem from '@mui/material/MenuItem';
import {RenameDialog} from '../Dialogs/rename-dialog';
import {StoreUtils} from '../../store/store-utils';


export const SketchesContainer = () => {
    const dispatch = useDispatch();
    const SketchIdInEdit = useSelector((state: ShmiraListStore) => state.SketchIdInEdit);
    const sketches: SketchModel[] = useSelector((state: { sketches: SketchModel[] }) => state.sketches);
    const [mock, setMock] = useState<boolean>(true)
    const [sketchMoreAnchorEl, setSketchMoreAnchorEl] =
        React.useState<null | HTMLElement>(null);
    const isSketchMenuOpen = Boolean(sketchMoreAnchorEl);
    const shmiraListId = useSelector((state: ShmiraListStore) => state.shmiraListId);
    const shmiraListCollection = useSelector((state: ShmiraListStore) => state.shmiraListCollection);
    const shmiraListSelected = shmiraListCollection.find((shmiraListRecord: ShmiraListRecord) => shmiraListRecord.id === shmiraListId);

    const sketchMenuId = 'primary-sketch-menu';
    const [RenameOpen, setRenameOpen] = React.useState(false);

    const handleSketchMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setSketchMoreAnchorEl(event.currentTarget);
    };
    const handleRenameClose = (value: string | null) => {
        setRenameOpen(false);
        const id = SketchIdInEdit;
        if (value) {
            dispatch({
                type: ActionsTypes.RENAME_SKETCH,
                payload: {
                    value,
                    id
                }
            })
        }
    };
    const handleSketchMenuClick = (event: React.MouseEvent<HTMLElement>, clickAction: SketchActionType) => {


        switch (clickAction) {

            case SketchActionType.CreateCopy:
                dispatch({
                    type: ActionsTypes.CLONE_SKETCH,
                    payload: {id: SketchIdInEdit}
                })
                break;

            case SketchActionType.Delete:
                dispatch({
                    type: ActionsTypes.DELETE_SKETCH,
                    payload: {id: SketchIdInEdit}
                })
                break;
            case SketchActionType.Rename:
                setRenameOpen(true);
                break;


            default:
        }
        handleSketchMenuClose()
    };
    const handleSketchMenuClose = () => {
        setSketchMoreAnchorEl(null);
    };
    const handleSketchChanged = (event: any, child: React.ReactNode) => {

        const chosenSketch = event.target.value as string;
        if (chosenSketch === 'NEW') {
            StoreUtils.shieldAnimationBeforeDispatch(() => {
                dispatch({
                    type: ActionsTypes.NEW_SKETCH,
                    payload: null
                })
            }, dispatch)


        } else {
            dispatch({
                type: ActionsTypes.CHOOSE_SKETCH,
                payload: {id: chosenSketch}
            })
        }


    }

    const handleCreateSketch = () => {
        StoreUtils.shieldAnimationBeforeDispatch(() => {
            dispatch({
                type: ActionsTypes.NEW_SKETCH,
                payload: null
            })
        }, dispatch)
    }
    const handleDownloadSketch = () => {
        StoreUtils.shieldAnimationBeforeDispatch(() => {
            dispatch({
                type: ActionsTypes.DOWNLOAD_SKETCH,
                payload: {
                    value: null,
                }
            })
        }, dispatch)
    }


    const sketchInEdit: SketchModel | null = sketches.find((sketch: SketchModel) => sketch.id === SketchIdInEdit) || null;

    const sketchName = sketchInEdit ? sketchInEdit.name : '';


    return (
        <Box>
            {SketchIdInEdit ? <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'start',
                justifyContent: 'start',
                mb: '10px'
            }}>
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{
                        display: {
                            xs: 'none',
                            sm: 'block',
                            fontWight: 'regular'
                        }
                    }}
                >    &nbsp;
                    {translations.Sketch} &nbsp;
                    <Select dir={'ltr'} disableUnderline={true} variant={'standard'} value={SketchIdInEdit}
                            sx={{
                                //  color: 'black',
                                fontSize: '1.25rem',
                                fontWeight: 'normal'
                            }}
                            onChange={(event: SelectChangeEvent<any>, child: React.ReactNode) => {
                                handleSketchChanged(event, child)
                            }}>
                        <MenuItem key={'NEW'}
                                  value={'NEW'}> &nbsp; <b>{translations.CreateSketch}</b>  &nbsp;</MenuItem>
                        {sketches.map((oneSketch: SketchModel) => <MenuItem key={oneSketch.id}
                                                                            value={oneSketch.id}> {oneSketch.name} &nbsp; </MenuItem>)}
                    </Select>
                </Typography>

                <IconButton
                    size="small"
                    aria-label="show more"
                    aria-controls={sketchMenuId}
                    aria-haspopup="true"
                    onClick={handleSketchMenuOpen}
                    color="inherit"
                >
                    <Edit/>
                </IconButton>
                <Box sx={{
                    width: '100px',
                    height: '12px'
                }}/>

                <Button variant={'contained'} id={'sketches-download-sketch'}
                        onClick={handleDownloadSketch}><GridOn/> &nbsp; {translations.downloadAsCSV}</Button>


            </Box> : <Button variant={'contained'} id={'sketches-create-sketch'}
                             onClick={handleCreateSketch}>{translations.CreateSketch}</Button>}


            <Sketch/>
            <SketchMenu sketchMoreAnchorEl={sketchMoreAnchorEl} sketchMenuId={SketchIdInEdit || ''} isSketchMenuOpen={isSketchMenuOpen}
                        handleSketchMenuClick={handleSketchMenuClick} handleSketchMenuClose={handleSketchMenuClose}/>
            <RenameDialog open={RenameOpen} onClose={handleRenameClose} selectedValue={sketchName}/>
        </Box>


    )

}
