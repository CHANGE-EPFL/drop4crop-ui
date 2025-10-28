import LayerCreate from './LayerCreate';
import LayerEdit from './LayerEdit';
import LayerList from './LayerList';
import LayerShow from './LayerShow';
import MapIcon from '@mui/icons-material/Map';

export default {
    create: LayerCreate,
    edit: LayerEdit,
    list: LayerList,
    show: LayerShow,
    recordRepresentation: 'name',
    icon: MapIcon,
};
