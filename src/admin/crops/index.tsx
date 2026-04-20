import CropList from './CropList';
import CropForm from './CropForm';
import { Create, Edit, SimpleForm } from 'react-admin';
import GrassIcon from '@mui/icons-material/Grass';

const CropCreate = () => (
    <Create redirect="list">
        <SimpleForm>
            <CropForm />
        </SimpleForm>
    </Create>
);

const CropEdit = () => (
    <Edit>
        <SimpleForm>
            <CropForm isEdit />
        </SimpleForm>
    </Edit>
);

export default {
    create: CropCreate,
    edit: CropEdit,
    list: CropList,
    recordRepresentation: 'name',
    icon: GrassIcon,
};
