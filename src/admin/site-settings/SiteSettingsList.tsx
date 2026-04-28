import { useEffect } from 'react';
import { useRedirect } from 'react-admin';

const SINGLETON_ID = '00000000-0000-0000-0000-000000000001';

const SiteSettingsList = () => {
    const redirect = useRedirect();
    useEffect(() => {
        redirect('edit', 'site-settings', SINGLETON_ID);
    }, [redirect]);
    return null;
};

export default SiteSettingsList;
