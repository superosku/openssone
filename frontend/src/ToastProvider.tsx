import React from 'react';
import './ToastProvider.scss'

interface IToast {
  message: string
  id: string
  visible: boolean
}

interface IToastContext {
  toasts: IToast[]
  addToast: (message: string) => void
}

export const ToastContext = React.createContext<IToastContext>({
  toasts: [],
  addToast: (message) => {}
})

interface IToastProvider {
  children: JSX.Element
}

export const ToastProvider = (
  {
    children
  }: IToastProvider
) => {
  const [toasts, setToasts] = React.useState<IToast[]>([])

  const removeToast = (id: string) => {
    setToasts(cur => {
      return cur.filter(t => t.id !== id)
    })
  }
  const setVisible = (id: string, visible: boolean) => {
    setToasts(cur => {
      return cur.map(t => {return {...t, visible: t.id === id ? visible: t.visible}})
    })
  }

  const addToast = (message: string) => {
    console.log('addToast called:', message)
    setToasts((cur) => {
      const id = Math.floor(Math.random() * 10000).toString(16)
      window.setTimeout(() => {
        removeToast(id)
      }, 2000)
      window.setTimeout(() => {
        setVisible(id, true)
      }, 0)
      window.setTimeout(() => {
        setVisible(id, false)
      }, 1750)
      return [...cur, {message, id, visible: false}]
    })
  }

  return <ToastContext.Provider
    value={{
      addToast,
      toasts
    }}
  >
    {toasts.length > 0 && <div className={'toasts'}>
      {toasts.map(t => {
        return <div className={'toast' + (t.visible ? '': ' hidden')}>
          {t.message}
        </div>
      })}
    </div>}
    {children}
  </ToastContext.Provider>
}
