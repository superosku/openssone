import './Loader.scss'

interface ILoaderProps {
  full?: boolean
}

// https://loading.io/css/
export const Loader = (props: ILoaderProps) => {
  const elem = <div className={'lds-dual-ring'} />
  if (props.full) {
    return <div className={'full-loader'}>
      {elem}
    </div>
  }
  return elem
}

