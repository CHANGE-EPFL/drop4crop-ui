import ClimateModelList from './ClimateModelList';
import ClimateModelForm from './ClimateModelForm';
import { Create, Edit, SimpleForm } from 'react-admin';
import CloudIcon from '@mui/icons-material/Cloud';

const ClimateModelCreate = () => (
    <Create redirect="list">
        <SimpleForm>
            <ClimateModelForm />
        </SimpleForm>
    </Create>
);

const ClimateModelEdit = () => (
    <Edit>
        <SimpleForm>
            <ClimateModelForm isEdit />
        </SimpleForm>
    </Edit>
);

export default {
    create: ClimateModelCreate,
    edit: ClimateModelEdit,
    list: ClimateModelList,
    recordRepresentation: 'name',
    icon: CloudIcon,
};
