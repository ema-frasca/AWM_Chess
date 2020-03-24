import React from "react";
import { LoadingPage, addWsListener, removeWsListener } from "./utils"


// here you can view/edit information about you account
// even if you are logged with google you can modify your username and email, but not your password
class AccountPage extends React.Component {
    constructor(props) {
        super(props);

        // ws message: {type: "account-page", username: STRING, email: STRING, rank: NUMBER, category: STRING, google: BOOL}
        this.pageRequest = {type: "account-page", f: this.getPageInfo, reqId: null};

        this.state = {
            user: {},
            loading: true
        }

    }

    componentDidMount() {
        this.pageRequest.reqId = addWsListener(this.pageRequest);
        global.wsSend({type: this.pageRequest.type});
    }

    getPageInfo = (content) => {
        this.setState({user: content, loading: false});
    }

    componentWillUnmount() {
        removeWsListener(this.pageRequest.reqId)
    }

    render() {
        if (this.state.loading)
            return <LoadingPage loading={true}/>;
        const user = this.state.user;
        
        return (
            <div>
                <h1><UserEditField field="username" value={user.username} btnClass="user" /></h1>
                <h2>Rank: {user.category} ({user.rank})</h2>
                Email: <UserEditField field="email" value={user.email} />
                {this.state.user.google ? <GoogleIcon /> : <PasswordChange />}
            </div>
        );
    }
}

function GoogleIcon(props) {
    return (
        <p className="with-icon">
            <img className="inline" width="10%" src={global.imgs + "google_account.png"} alt="google icon"></img>
            Google Account
        </p>
    );
}

// Component for editing username and email
// sending empty string won't modify anything
class UserEditField extends React.Component {
    constructor(props) {
        super(props);
        
        // ws message: {type: "account-edit", field: STRING, (error: STRING)}
        this.editRequest = {type: "account-edit", f: this.getError, reqId: null};

        this.state = {
            onEdit: false,
            text: "",
            error: null
        };
    }

    componentDidMount() {
        this.editRequest.reqId = addWsListener(this.editRequest);
    }

    componentWillUnmount() {
        removeWsListener(this.editRequest.reqId);
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
        // if enter onEdit:
        if (onEdit)
            this.setState({text: this.props.value});

        // if exit onEdit
        if (!onEdit) {
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
        let btnText = this.props.value ? "change " : "add ";
        btnText += this.props.field;
        if (this.state.onEdit){
            value = <input type="text" value={this.state.text} style={{width: 3+this.state.text.length + "ch"}}
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

// Component for change your password
// if change is successfull you will be redirected to login page
class PasswordChange extends React.Component {
    constructor(props) {
        super(props);
        
        // ws message: {type: "account-psw", (error: STRING)}
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
        this.pswRequest.reqId = addWsListener(this.pswRequest);
    }

    componentWillUnmount() {
        removeWsListener(this.pswRequest.reqId);
    }

    getResponse = (content) => {
        if ("error" in content)
            this.setState({response: content.error, error: true});
        else {
            setTimeout(() => window.location.replace("http://"+window.location.host) , 1000);
            this.setState({
                onEdit: false, error: false,
                response: "Your password has been successfully changed"
            });
        }
    }

    handleChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const onEdit = !this.state.onEdit;
        
        // Send request if at least one field is not empty
        if (!onEdit && (this.state.textOld || this.state.textNew1 || this.state.textNew2)) {
            global.wsSend({
                type: this.pswRequest.type,
                old: this.state.textOld,
                new1: this.state.textNew1,
                new2: this.state.textNew2
            });
        } else 
            this.setState({onEdit: onEdit});

        this.setState({textOld: "", textNew1: "", textNew2: "", error: false, response: null});
    }

    render() {
        const btnText = this.state.onEdit ? "enter" : "change password";

        return (
            <form onSubmit={this.handleSubmit}>
                <button type="submit">{btnText}</button>
                <div className={this.state.response ? "form-msg " + (this.state.error ? "red" : "green") : "hidden"}>{this.state.response}</div>
                <table className={this.state.onEdit ? "" : "hidden"}>
                    <tbody>
                    <tr><td>Old password: </td><td><input type="password" name="textOld" value={this.state.textOld} onChange={this.handleChange} /></td></tr>
                    <tr><td>New password: </td><td><input type="password" name="textNew1" value={this.state.textNew1} onChange={this.handleChange} /></td></tr>
                    <tr><td>Confirm password: </td><td><input type="password" name="textNew2" value={this.state.textNew2} onChange={this.handleChange} /></td></tr>
                    <tr><td colSpan="2">You will be redirect to login after a successful change</td></tr>
                    </tbody>
                </table>
            </form>
        );
    }
}

export default AccountPage;