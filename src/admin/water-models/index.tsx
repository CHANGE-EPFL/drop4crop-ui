import WaterModelList from './WaterModelList';
import WaterModelForm from './WaterModelForm';
import { Create, Edit, SimpleForm } from 'react-admin';
import WaterIcon from '@mui/icons-material/Water';

const WaterModelCreate = () => (
    <Create redirect="list">
        <SimpleForm>
            <WaterModelForm />
        </SimpleForm>
    </Create>
);

const WaterModelEdit = () => (
    <Edit>
        <SimpleForm>
            <WaterModelForm isEdit />
        </SimpleForm>
    </Edit>
);

export default {
    create: WaterModelCreate,
    edit: WaterModelEdit,
    list: WaterModelList,
    recordRepresentation: 'name',
    icon: WaterIcon,
};
