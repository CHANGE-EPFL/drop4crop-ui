import ShowcaseItemList from './ShowcaseItemList';
import ShowcaseItemForm from './ShowcaseItemForm';
import { Create, Edit, SimpleForm } from 'react-admin';
import SlideshowIcon from '@mui/icons-material/Slideshow';

const ShowcaseItemCreate = () => (
    <Create redirect="list">
        <SimpleForm>
            <ShowcaseItemForm />
        </SimpleForm>
    </Create>
);

const ShowcaseItemEdit = () => (
    <Edit>
        <SimpleForm>
            <ShowcaseItemForm isEdit />
        </SimpleForm>
    </Edit>
);

export default {
    create: ShowcaseItemCreate,
    edit: ShowcaseItemEdit,
    list: ShowcaseItemList,
    recordRepresentation: 'title',
    icon: SlideshowIcon,
};
