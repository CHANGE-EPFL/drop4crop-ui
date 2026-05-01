import VariableGroupList from './VariableGroupList';
import VariableGroupForm from './VariableGroupForm';
import { Create, Edit, SimpleForm } from 'react-admin';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

const VariableGroupCreate = () => (
    <Create redirect="list">
        <SimpleForm>
            <VariableGroupForm />
        </SimpleForm>
    </Create>
);

const VariableGroupEdit = () => (
    <Edit>
        <SimpleForm>
            <VariableGroupForm isEdit />
        </SimpleForm>
    </Edit>
);

export default {
    create: VariableGroupCreate,
    edit: VariableGroupEdit,
    list: VariableGroupList,
    recordRepresentation: 'name',
    icon: AccountTreeIcon,
};
