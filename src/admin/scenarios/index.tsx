import ScenarioList from './ScenarioList';
import ScenarioForm from './ScenarioForm';
import { Create, Edit, SimpleForm } from 'react-admin';
import TuneIcon from '@mui/icons-material/Tune';

const ScenarioCreate = () => (
    <Create redirect="list">
        <SimpleForm>
            <ScenarioForm />
        </SimpleForm>
    </Create>
);

const ScenarioEdit = () => (
    <Edit>
        <SimpleForm>
            <ScenarioForm isEdit />
        </SimpleForm>
    </Edit>
);

export default {
    create: ScenarioCreate,
    edit: ScenarioEdit,
    list: ScenarioList,
    recordRepresentation: 'name',
    icon: TuneIcon,
};
