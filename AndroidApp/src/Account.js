import React from 'react'
import { View, Keyboard, ScrollView, KeyboardAvoidingView } from 'react-native'
import { imgs, addWsListener, removeWsListener, LoadingPage, MyImage } from './utils'
import styles, { FadeInView, MyText, MyTextInput, MyButton } from './styles'
import { RFPercentage } from "react-native-responsive-fontsize";


class AccountPage extends React.Component {
    constructor(props) {
        super(props);

        this.pageRequest = {type: "account-page", f: this.getPageInfo, reqId: null};

        this.state = {
            user: {},
            loading: true,
            avoidKeyboard: true,
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

    avoidKeyboardChange = (avoid) => {
        this.setState({avoidKeyboard: avoid});
    }

    render() {
        if (this.state.loading)
            return <LoadingPage />;
        const user = this.state.user;
        
        return (
            <ScrollView style={{paddingTop: '2%'}} keyboardShouldPersistTaps="handled">
                <KeyboardAvoidingView keyboardVerticalOffset={-RFPercentage(18)} 
                behavior="position" enabled={this.state.avoidKeyboard}>
                    <FadeInView style={{alignItems: 'center'}}>
                        <UserEditField field="username" value={user.username} akc={this.avoidKeyboardChange} />
                        <MyText size={2} bold style={{marginBottom: '3%'}} >Rank: {user.category} ({user.rank})</MyText>
                        <UserEditField field="email" value={user.email} akc={this.avoidKeyboardChange} />
                        {this.state.user.google ? <GoogleIcon /> : <PasswordChange />}
                        <MyButton onPress={global.logout} >Logout</MyButton>
                    </FadeInView>
                </KeyboardAvoidingView>
            </ScrollView>
        );
    }
}

function GoogleIcon(props) {
    return (
        <View >
            <MyImage name="googleAccount" width="10%" noHeight />
            <MyText>Google Account</MyText>
        </View>
    );
}

class UserEditField extends React.Component {
    constructor(props) {
        super(props);
        
        this.editRequest = {type: "account-edit", f: this.getError, reqId: null};

        this.state = {
            onEdit: false,
            value: "",
            error: null,
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

    handleSubmit = () => {
        const onEdit = !this.state.onEdit;
        if (onEdit)
            this.setState({value: this.props.value});

        if (!onEdit) {
            this.props.akc(true)
            global.wsSend({
                type: this.editRequest.type,
                field: this.props.field,
                value: this.state.value,
            });
        } else 
            this.setState({onEdit: onEdit});
    }

    render() {
        let field = null;
        let btnText = this.props.value ? "change " : "add ";
        btnText += this.props.field;
        if (this.state.onEdit){
            field = (<MyTextInput size={3} value={this.state.value} width="70%" 
                onChangeText={(text) => this.setState({value: text})} 
                placeHolder={this.props.field}
                onFocus={() => this.props.akc(false)}
                onBlur={() => this.props.akc(true)}
            />);
            btnText = "enter";
        } else {
            if (this.props.field === "email")
                field = <MyText size={3} >Email: {this.props.value}</MyText>;
            else
                field = <MyText size={1} bold>{this.props.value}</MyText>;
        }

        return (
            <View style={{alignItems: 'center', width: '100%'}}>
                {field}
                {this.state.error ? <MyText color="red">{this.state.error}</MyText> : null }
                <MyButton size={6} onPress={this.handleSubmit}>{btnText}</MyButton>
            </View>
        );
    }
}

class PasswordChange extends React.Component {
    // response className={this.state.response ? "form-msg " + (this.state.error ? "red" : "green") : "hidden"}
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
        this.pswRequest.reqId = addWsListener(this.pswRequest);
    }

    componentWillUnmount() {
        removeWsListener(this.pswRequest.reqId);
    }

    getResponse = (content) => {
        if ("error" in content)
            this.setState({response: content.error, error: true});
        else {
            this.setState({
                onEdit: false, error: false,
                response: "Your password has been successfully changed"
            });
        }
    }

    handleSubmit = () => {
        const onEdit = !this.state.onEdit;
        
        // Send request if at least one field is not empty
        if (!onEdit && (this.state.textOld || this.state.textNew1 || this.state.textNew2)) {
            global.wsSend({
                type: this.pswRequest.type,
                old: this.state.textOld,
                new1: this.state.textNew1,
                new2: this.state.textNew2,
            });
        } else 
            this.setState({onEdit: onEdit});

        this.setState({textOld: "", textNew1: "", textNew2: "", error: false, response: null});
    }

    render() {
        const btnText = this.state.onEdit ? "enter" : "change password";

        return (
            <View style={{width: '80%', marginBottom: '3%'}}>
                <MyButton onPress={this.handleSubmit}>{btnText}</MyButton>
                {this.state.response ? (
                    <MyText color={this.state.error ? 'red' : 'green'}>{this.state.response}</MyText>
                    ) : null }
                {this.state.onEdit ? (
                    <FadeInView style={{alignItems: 'center'}}>
                        <MyText>Old password</MyText>
                        <MyTextInput
                            value={this.state.textOld} 
                            onChangeText={(text) => this.setState({textOld: text})}
                            secureTextEntry
                        />
                        <MyText>New password</MyText>
                        <MyTextInput 
                            value={this.state.textNew1} 
                            onChangeText={(text) => this.setState({textNew1: text})}
                            secureTextEntry
                        />
                        <MyText>Confirm password</MyText>
                        <MyTextInput 
                            value={this.state.textNew2} 
                            onChangeText={(text) => this.setState({textNew2: text})}
                            secureTextEntry
                        />
                    </FadeInView>
                ) : null}
            </View>
        );
    }
}

export default AccountPage;