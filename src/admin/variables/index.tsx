import VariableList from './VariableList';
import VariableForm from './VariableForm';
import { Create, Edit, SimpleForm } from 'react-admin';
import FunctionsIcon from '@mui/icons-material/Functions';

const VariableCreate = () => (
    <Create redirect="list">
        <SimpleForm>
            <VariableForm />
        </SimpleForm>
    </Create>
);

const VariableEdit = () => (
    <Edit>
        <SimpleForm>
            <VariableForm isEdit />
        </SimpleForm>
    </Edit>
);

export default {
    create: VariableCreate,
    edit: VariableEdit,
    list: VariableList,
    recordRepresentation: 'name',
    icon: FunctionsIcon,
};
