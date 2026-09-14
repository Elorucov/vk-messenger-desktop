import React, { Fragment, ReactChild, ReactElement, ReactFragment } from 'react'
import {
  IOverrideLangParams,
  IOverrideILang,
} from '@vkontakte-internal/messenger'

type Props<K extends keyof Params> = {
  className?: string
  langkey: K
  lang: IOverrideILang
} & (Params[K][0] extends undefined ? {} : Params[K][0])

type Params = IOverrideLangParams<ReactChild | ReactFragment>

export const formatLangKey = <K extends keyof Params>(
  props: Props<K>,
): ReactElement => {
  const { className, langkey, lang, ...opts } = props

  return lang.fold(
    langkey,
    (x) => <>{x}</>,
    (xs) => {
      // Если мы находимся в дев окружении, то хотим убрать
      // варнинг про отсутствие ключей у Реакта.
      // Это сделано для красоты АПИ компонента.
      // Иначе во всех местах его использования надо было бы
      // придумывать всякие ключи для замен.
      // При этом в прод билде Реакт сам задефолтится к индексам,
      // поэтому делать операцию клонирования ни к чему.
      if (import.meta?.env?.DEV) {
        xs = xs.map((x, index) =>
          typeof x === 'string' ? (
            <Fragment key={index}>{x}</Fragment>
          ) : (
            React.cloneElement(x, { ...x.props, key: index })
          ),
        )
      }

      return <span className={className}>{xs}</span>
    },
    /**
     * С типами ниже все сложно, поэтому приходится использовать небольшой хак.
     * Считаем, что тут он не страшен, поскольку место достаточно изолированное
     * и скорее всего не будет меняться никогда.
     */
    // @ts-expect-error
    opts,
  )
}
