import React, { Component, Fragment, useState } from 'react';
import Progress from 'react-progressbar';
import axios from 'axios';

class FileUpload extends Component {
    state = {
        file: null,
        filename: 'Choose file',
        uploadedFile: null,
        message: '',
        error: true,
        isOpen: false,
        percentage: 0
    }

    onChange = e => {
        this.setState({
            file: e.target.files[0],
            filename: e.target.files[0].name
        });
    }

    toggleAlert = () => {
        this.setState({ isOpen: !this.state.isOpen })
    }

    onSubmit = async e => {
        e.preventDefault();

        if(this.state.file === null) {
            this.setState({ message: 'No file was selected.', error: true });
            this.toggleAlert();
        }

        else {
            const formData = new FormData();
            formData.append('file', this.state.file);

            await axios.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }, 
                onUploadProgress: progressEvent => {
                    let percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    this.setState({ percentage });
                    setTimeout(() => this.setState({ file: null, filename: 'Choose file', percentage: 0 }), 2000);
                }})
            .then(res => {
                let { fileName, filePath } = res.data;
                let uploadedFile = {
                    fileName,
                    filePath
                };

                this.setState({
                    uploadedFile,
                    message: 'File uploaded successfully!',
                    error: false
                });
                this.toggleAlert();
            })
            .catch(err => {
                if(err.response.status === 500)
                    this.setState({ message: 'There was a problem with the server.', error: true });
                else
                    this.setState({ message: err.response.data.message, error: true });
                this.toggleAlert();
            });
        }
    }

    render() {
        const { filename, uploadedFile, message, error, isOpen, percentage } = this.state;

        let dangerAlert = (<div className="alert alert-danger alert-dismissible fade show" role="alert">
                                {message}
                                <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={this.toggleAlert}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>);
        let successAlert = (<div className="alert alert-success alert-dismissible fade show" role="alert">
                                {message}
                                <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={this.toggleAlert}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>);
        let alert = error ? dangerAlert : successAlert;
        alert = isOpen ? alert : null;

        let uploadedImageDiv = uploadedFile ?
            (<div className="row mt-5">
                <div className="col-md-6 m-auto">
                    <h3 className="text-center"> {uploadedFile.fileName} </h3>
                    <img style={{ width: '100%' }} src={`${uploadedFile.filePath}`} alt=''/>
                </div>
            </div>)
            :
            null;

        return (
            <Fragment>

                {alert}

                <form onSubmit={this.onSubmit}>
                    <div className="custom-file">
                        <input type="file" className="custom-file-input" id="customFile" onChange={this.onChange}/>
                        <label className="custom-file-label" htmlFor="customFile">
                            {filename}
                        </label>
                    </div>

                    <div className="mt-3">
                        <Progress completed={percentage}/>
                    </div>
                    
                    <input type="submit" value="Upload" className="btn btn-success btn-block mt-3"/>
                </form>
                
                {uploadedImageDiv}
            </Fragment>
        )
    }
}

export default FileUpload;
