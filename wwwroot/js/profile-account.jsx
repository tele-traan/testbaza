﻿class ManageAccountForm extends React.Component {
    constructor(props) {
        super(props);

        this.populateData = this.populateData.bind(this);
        this.renderForm = this.renderForm.bind(this);
        this.onNameChanged = this.onNameChanged.bind(this);
        this.onEmailChanged = this.onEmailChanged.bind(this);
        this.onPasswordChanged = this.onPasswordChanged.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = { isLoading: true, isSaved: true, noErrors: true, errors: [], user: null };
    }

    componentDidMount() {
        this.populateData();
    }

    render() {
        const isLoading = this.state.isLoading;
        return (
        <div className="text-center">
            { isLoading
                ? <h3>Загрузка...</h3>
                : this.renderForm()
            }
        </div>
        );
    }

    renderForm() {
        const user = this.state.user, errors = this.state.errors;
        return (<div>
            <div>{errors.map(error => 
                <h3 key={error} className="text-danger">{error}</h3>
                )}
            </div>
            <form>
                <UserNameInput defaultUsername={user.userName} handleChange={this.onNameChanged} />
                <EmailInput defaultEmail={user.email} handleChange={this.onEmailChanged} />
                <PasswordInput handleChange={this.onPasswordChanged} />
                {this.state.isSaved || !this.state.noErrors
                    ? <button className="btn btn-outline-primary"
                        onClick={e => this.handleSubmit(e)} disabled>Сохранить изменения</button>
                    : <button className="btn btn-outline-primary"
                        onClick={e => this.handleSubmit(e)}>Сохранить изменения</button>
                }
            </form>
        </div>);
    }

    async populateData() {
        await fetch('/profile/user-info').then(async response => {
            if (response.status === 200) {
                const object = await response.json();
                const result = object.result;
                console.log(result);
                this.setState({ isLoading: false, user: result });
            } else {
                window.location.replace('/');
            }
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        const user = this.state.user;

        if (user.password === null || user.password === undefined || user.password === "") {
            alert('Вы не ввели пароль');
            return;
        }

        const formData = new FormData();
        formData.append('username', user.userName);
        formData.append('email', user.email);
        formData.append('password', user.password);

        await fetch('/profile/update-user', {
            method: 'POST',
            body: formData
        }).then(async response => {
            if (response.status === 200) {
                this.setState({ isSaved: true });
            } else if (response.status === 400) {
                const result = await response.json();
                const errors = result.errors;
                console.log(errors);
                this.setState({ isSaved: false, noErrors: false, errors: errors });
            }
        });
    }

    onNameChanged(newUserName) {
        if (newUserName === "" || newUserName === null) return { isSuccess: false, error: 'Вы не ввели имя' };
        if (newUserName.length < 4) {
            this.setState({ noErrors: false });
            return { isSuccess: false, error: 'Имя должно быть длиной не менее 3 символов' };
        }
        if (newUserName.length > 20) {
            this.setState({ noErrors: false });
            return { isSuccess: false, error: 'Имя должно быть длиной не более 20 символов' };
        }

        const user = this.state.user;
        user.userName = newUserName;

        this.setState({ isSaved: false, noErrors: true, user: user });
        return { isSuccess: true, error: null };
    }

    onEmailChanged(newEmail) {
        const emailRegexp = /^(?!\s)(\d|\w)+@\w+\.\w+$/ig;
        if (!emailRegexp.test(newEmail)) {
            this.setState({ noErrors: false });
            return { isSuccess: false, error: 'Вы ввели некорректный адрес эл.почты' };
        }

        const user = this.state.user;
        user.email = newEmail;

        this.setState({ isSaved: false, noErrors: true, user: user });
        return { isSuccess: true, error: null};
    }

    onPasswordChanged(newPassword) {
        const user = this.state.user;
        user.password = newPassword;
        this.setState({ isSaved: false, user: user });
        return { isSuccess: true, error: null };
    }
}

class UserNameInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = { isChanged: false, isSuccess: false, error: null };

        this.onChange = this.onChange.bind(this);
    }

    render() {
        return(
        <div className="form-group">
            {this.state.isChanged
                ? this.state.isSuccess
                    ? null
                    : <h4 className="text-danger">{this.state.error}</h4>
                : null
            }
            <label>Имя пользователя</label>
            <input type="text" className="form-control" name="username"
                defaultValue={this.props.defaultUsername} onChange={e => this.onChange(e)} />
        </div>)
    }

    onChange(event) {
        const newUsername = event.target.value;
        const { isSuccess, error } = this.props.handleChange(newUsername);
        this.setState({ isChanged: true, isSuccess: isSuccess, error: error });
    }
}

class EmailInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = { isChanged: false, isSuccess: false, error: null };

        this.onChange = this.onChange.bind(this);
    }

    render() {
        return (
            <div className="form-group">
                {this.state.isChanged
                    ? this.state.isSuccess
                        ? null
                        : <h4 className="text-danger">{this.state.error}</h4>
                    : null
                }
                <label>Эл. почта</label>
                <input type="text" className="form-control" name="email"
                    defaultValue={this.props.defaultEmail} onChange={e => this.onChange(e)} />

            </div>
        );
    }

    onChange(event) {
        const newEmail = event.target.value;
        const { isSuccess, error } = this.props.handleChange(newEmail);
        this.setState({ isChanged: true, isSuccess: isSuccess, error: error });
    }
}

class PasswordInput extends React.Component {
    constructor(props) {
        super(props);

        this.state = { isChanged: false, isSuccess: false, error: null };

        this.onChange = this.onChange.bind(this);
    }

    render() {
        return (
            <div>
                {this.state.isChanged
                    ? this.state.isSuccess
                        ? null
                        : <h3 className="text-danger">{this.state.error}</h3>
                    : null
                }
            {/*<div className="form-group">*/}
            {/*        <label>Старый пароль</label>*/}
            {/*        {this.state.isChanged*/}
            {/*            ? this.state.isSuccess*/}
            {/*                ? <input type="password" className="form-control" name="oldpassword"*/}
            {/*                    onBlur={e => this.onBlur(e)} />*/}
            {/*                : <input type="password" className="form-control" name="oldpassword" readOnly disabled/>*/}
            {/*            : <input type="password" className="form-control" name="oldpassword"*/}
            {/*                onBlur={e => this.onBlur(e)} />*/}
            {/*        }*/}
            {/*</div>*/}
            <div className="form-group">
                <label>Подтверждение пароля</label>
                    <input type="password" className="form-control" name="confirmpassword"
                        onChange={e=>this.onChange(e)} />
            </div>
            </div>);
    }

    onChange(event) {
        const elem = event.target;
        const value = elem.value, fieldType = elem.name;
        const { isSuccess, error } = this.props.handleChange(value, fieldType);
        this.setState({ isChanged: true, isSuccess: isSuccess, error: error })
    }
}

class PasswordChangeForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = { oldPassword: null, newPassword: null, error: null };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    render() {
        return (
            <form>
                {this.state.error === null ? null : <h3 className="text-danger">{this.state.error}</h3>}
                <div className="form-group">
                    <label>Старый пароль</label>
                    <input type="password" className="form-control" name="oldpassword" onChange={e => this.handleChange(e, "old")} />
                </div>
                <div className="form-group">
                    <label>Новый пароль</label>
                    <input type="password" className="form-control" name="newpassword" onChange={e => this.handleChange(e, "new")} />
                </div>
                <button className="btn btn-outline-primary" onClick={e=>this.handleSubmit(e)}>Изменить пароль</button>
            </form>
            )
    }

    async handleSubmit(e) {
        e.preventDefault();
        let { oldPassword, newPassword, error } = this.state;
        if (oldPassword === null || oldPassword === undefined || oldPassword === "") {
            error = "Вы не ввели текущий пароль";
            this.setState({ error: error });
        }
        if (newPassword === null || newPassword === undefined || newPassword === "") {
            error = "Вы не ввели новый пароль";
            this.setState({ error: error });
        }
        if (oldPassword === newPassword && oldPassword !== null) {
            error = "Пароли совпадают";
            this.setState({ error: error });
        }

        const formData = new FormData();
        formData.append('oldpassword', oldPassword);
        formData.append('newpassword', newPassword);

        await fetch('/profile/change-password', {
            method: 'POST',
            body: formData
        }).then(async response => {
            if (response.status === 200) {
                alert('Пароль успешно изменён');
                this.setState({oldPassword: null, newPassword: null, error: null});
            } else {
                const object = await response.json();
                const error = object.error;
                this.setState({ error: error });
            }
        });
    }

    handleChange(event, type) {
        event.preventDefault();
        const value = event.target.value;
        let error = this.state.error;
        if (type === "new") {
            const regexp = /(?!\s)(?=.*([а-яА-ЯёЁ]|[a-zA-Z]))(?=.*[0-9]).{6,30}/ig;
            if (!regexp.test(value)) {
                error = 'Пароль должен содержать от 6 до 30 символов, не иметь пробела, иметь цифры и буквы';
                this.setState({ error: error });
                return;
            } else {
                error = null;
                this.setState({ newPassword: value, error: error });
            }
        } else {
            this.setState({oldPassword: value});
        }
    }
}