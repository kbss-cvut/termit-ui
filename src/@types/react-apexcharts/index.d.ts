declare module 'react-apexcharts' {

    interface Props {
        options : any
        series : any
        type : any
        width : any
        height : any
    }

    export default class Chart extends React.Component<Props> {}
}