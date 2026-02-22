import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const showConfirm = async (title: string, text: string, confirmButtonText = 'Yes, delete it!') => {
    return MySwal.fire({
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4f46e5', // indigo-600
        cancelButtonColor: '#44403c', // stone-700
        confirmButtonText,
        background: '#1c1917', // stone-900
        color: '#fff',
        customClass: {
            popup: 'border border-stone-800 rounded-xl px-4 py-2',
            title: 'text-xl font-bold',
            confirmButton: 'rounded-lg px-6 py-2.5 font-semibold text-sm',
            cancelButton: 'rounded-lg px-6 py-2.5 font-semibold text-sm',
        },
    });
};

export const showAlert = (title: string, text: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    return MySwal.fire({
        title,
        text,
        icon,
        timer: 2000,
        showConfirmButton: false,
        background: '#1c1917',
        color: '#fff',
        customClass: {
            popup: 'border border-stone-800 rounded-xl',
        }
    });
};

export default MySwal;
