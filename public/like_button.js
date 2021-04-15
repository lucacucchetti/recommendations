'use strict';

const e = React.createElement;

class LikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { id: props.id };
    if (props.votes) {
      this.state.votes = JSON.parse(props.votes);
    } else {
      this.state.votes = [];
    }
    this.state.liked = this.amILiked();
  }

  amILiked() {
    return this.state.votes.includes(getUser());
  }

  render() {
    if (this.amILiked()) {
      return e('i', { class: 'float-right bi bi-hand-thumbs-up-fill', onClick: () => this.removeVote() });
    }

    return e('i', { class: 'bi bi-hand-thumbs-up float-right', onClick: () => this.vote() });
  }

  vote() {
    this.post('vote');
    this.setState({
      liked: true,
    });
    this.state.votes.push(getUser());
  }

  removeVote() {
    this.post('remove-vote');
    this.setState({
      liked: false,
      votes: this.state.votes.filter((vote) => vote !== getUser()),
    });
  }

  post(path) {
    fetch(`/recommendations/${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: this.props.id,
        who: getUser(),
      }),
    }).catch(console.error);
  }

  like(flag) {
    this.setState({ liked: flag });
  }
}

const buttons = document.querySelectorAll('.like_button');
buttons.forEach((button) =>
  ReactDOM.render(e(LikeButton, { id: button.dataset.id, votes: button.dataset.votes }), button)
);
