import { Menu } from 'react-admin';
import SubMenu from './SubMenu';
import ExpandMore from '@mui/icons-material/ExpandMore';

export const MyMenu = () => (
    <Menu>
        <Menu.DashboardItem />
        <hr style={{ width: '70%' }} />
        <Menu.ResourceItem name="projects" />
        <Menu.ResourceItem name="showcase-items" />
        <hr style={{ width: '70%' }} />
        <Menu.ResourceItem name="layers" />
        <SubMenu text="Layer Attributes" icon={<ExpandMore />}>
            <Menu.ResourceItem name="crops" />
            <Menu.ResourceItem name="water-models" />
            <Menu.ResourceItem name="climate-models" />
            <Menu.ResourceItem name="scenarios" />
            <Menu.ResourceItem name="variables" />
        </SubMenu>
        <Menu.ResourceItem name="styles" />
        <hr style={{ width: '70%' }} />
        <Menu.ResourceItem name="statistics" />
        <Menu.ResourceItem name="cache" />
    </Menu>
);
