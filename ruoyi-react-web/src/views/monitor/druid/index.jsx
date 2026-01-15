import './index.scss'

const Druid = () => {
  const url = '/druid/index.html'
  return (
    <div className="app-container druid-page">
      <iframe
        src={url}
        title="Druid"
        style={{ width: '100%', height: 'calc(100vh - 120px)', border: 'none' }}
      />
    </div>
  )
}

export default Druid
