declare module 'react-angular' {

    interface Result { name: string}

    export function reactAngularModule(x : boolean) : Result

    interface Props {
        scope:  any
    }

    export class AngularTemplate extends React.Component<Props> {}
}
