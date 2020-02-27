import React from "react";

class AccountPage extends React.Component {
    constructor(props) {
        super(props);

        this.pageRequest = {type: "account-page", f: this.getPageInfo, reqId: null};

        this.state = {
            user: {}
        }

    }

    componentDidMount() {
        this.pageRequest.reqId = global.wsOnMessage.push(this.pageRequest) - 1;
        global.wsSend({type: this.pageRequest.type});
    }

    getPageInfo = (content) => {
        this.setState({user: content});
    }

    componentWillUnmount() {
        global.wsOnMessage.splice(this.pageRequest.reqId, 1);
    }

    render() {
        const user = this.state.user;
        let email;
        if (user.email === "")
            email = <div><button>Add email</button></div>;
        else
            email = <div>Email: <UserEditField field="email" value={user.email} /></div>;
        
        return (
            <div>
                <h1><UserEditField field="username" value={user.username} btnClass="user" /></h1>
                <h2>Rank: {user.category} ({user.rank})</h2>
                {email}
                {this.state.user.google ? "Google account" : <PasswordChange />}
            </div>
        );
    }
}

class UserEditField extends React.Component {
    constructor(props) {
        super(props);
        
        this.editRequest = {type: "account-edit", f: this.getError, reqId: null};

        this.state = {
            onEdit: false,
            text: "",
            error: null
        };
    }

    componentDidMount() {
        this.editRequest.reqId = global.wsOnMessage.push(this.editRequest) - 1;
    }

    componentWillUnmount() {
        global.wsOnMessage.splice(this.editRequest.reqId, 1);
    }

    getError = (content) => {
        if (content.field === this.props.field)
            if ("error" in content)
                this.setState({error: content.error});
            else
                this.setState({onEdit: false, error: null});
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const onEdit = !this.state.onEdit;
        if (onEdit)
            this.setState({text: this.props.value});

        if (! onEdit) {
            global.wsSend({
                type: this.editRequest.type,
                field: this.props.field,
                value: this.state.text
            });
        } else 
            this.setState({onEdit: onEdit});
    }

    render() {
        let value = this.props.value;
        let btnText = "change " + this.props.field;
        if (this.state.onEdit){
            value = <input type="text" value={this.state.text} style={{width: 1+this.state.text.length + "ch"}}
                    onChange={(e) => this.setState({text: e.target.value})} />;
            btnText = "enter";
        }

        return (
            <form className="inline" onSubmit={this.handleSubmit}>
                
                {value}
                <button type="submit" className={"edit-btn "+this.props.btnClass}>{btnText}</button>
                <div className={this.state.error ? "form-msg red" : "hidden"}>{this.state.error}</div>
            </form>
        );
    }
}

class PasswordChange extends React.Component {
    constructor(props) {
        super(props);
        
        this.pswRequest = {type: "account-psw", f: this.getResponse, reqId: null};

        this.state = {
            onEdit: false,
            response: null,
            error: false,
            textOld: "",
            textNew1: "",
            textNew2: "",
        };
    }

    componentDidMount() {
        this.pswRequest.reqId = global.wsOnMessage.push(this.pswRequest) - 1;
    }

    componentWillUnmount() {
        global.wsOnMessage.splice(this.pswRequest.reqId, 1);
    }

    getResponse = (content) => {
        if ("error" in content)
            this.setState({response: content.error, error: true});
        else
            this.setState({
                onEdit: false, error: false,
                response: "Your password has been succesfully changed"
            });
    }

    handleChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const onEdit = !this.state.onEdit;
        
        if (! onEdit) {
            global.wsSend({
                type: this.pswRequest.type,
                old: this.state.textOld,
                new1: this.state.textNew1,
                new2: this.state.textNew2
            });
        } else 
            this.setState({onEdit: onEdit});
    }

    render() {
        const btnText = this.state.onEdit ? "enter" : "change password";

        return (
            <form onSubmit={this.handleSubmit}>
                <button type="submit">{btnText}</button>
                <div className={this.state.response ? "form-msg " + (this.state.error ? "red" : "green") : "hidden"}>{this.state.response}</div>
                <table className={this.state.onEdit ? "" : "hidden"}>
                    <tr><td>Old password: </td><td><input type="password" name="textOld" value={this.state.textOld} onChange={this.handleChange} /></td></tr>
                    <tr><td>New password: </td><td><input type="password" name="textNew1" value={this.state.textNew1} onChange={this.handleChange} /></td></tr>
                    <tr><td>Confirm password: </td><td><input type="password" name="textNew2" value={this.state.textNew2} onChange={this.handleChange} /></td></tr>
                </table>
            </form>
        );
    }
}

export default AccountPage;