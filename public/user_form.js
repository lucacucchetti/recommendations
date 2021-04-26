class UserForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: getUser() ? getUser() : '' };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ user: event.target.value });
  }

  handleSubmit() {
    setUser(this.state.user);
    window.location.reload();
  }

  render() {
    return e(
      'form',
      { onSubmit: this.handleSubmit },
      e(
        'div',
        { class: 'input-group' },
        e('input', {
          type: 'text',
          class: 'form-control',
          onChange: this.handleChange,
          value: this.state.user,
          placeholder: getUserFormPlaceholder(),
        }),
        e(
          'div',
          { class: 'input-group-append' },
          e('button', { class: 'btn btn-info', type: 'submit' }, e('i', { class: 'bi bi-person-check' }))
        )
      )
    );
  }
}

const navBars = document.querySelectorAll('.user_form');
navBars.forEach((navBar) => ReactDOM.render(e(UserForm), navBar));
