import autoImport from 'unplugin-auto-import/vite'

export default function createAutoImport() {
    return autoImport({
        imports: [
            'react',
            {
                'react-router-dom': ['useNavigate', 'useLocation', 'useParams', 'useSearchParams']
            }
        ],
        dts: false,
        eslintrc: {
            enabled: false
        }
    })
}
