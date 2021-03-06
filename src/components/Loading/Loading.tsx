import * as React from 'react'
import './Loading.scss';

export default class PanelPage extends React.Component {
    constructor(props: {}) {
        super(props);
    }

    render() {
        return (
            <div className="loading">
                <div className="loading-sign">
                    <div className="preloader-wrapper big active">
                        <div className="spinner-layer spinner-white-only">
                            <div className="circle-clipper left">
                                <div className="circle" />
                            </div>
                            <div className="gap-patch">
                                <div className="circle" />
                            </div>
                            <div className="circle-clipper right">
                                <div className="circle" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
