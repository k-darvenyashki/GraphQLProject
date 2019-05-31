import React, { Component } from 'react';

import './Main.css';

class MainPage extends Component {
  state = {
    creating: false,
    games: []
  };


  constructor(props) {
    super(props);

    this.titleEl = React.createRef();
    this.descriptionEl = React.createRef();
    this.priceEl = React.createRef();
  }

  componentDidMount() {
    this.fetchGames();
  }
  
  fetchGames() {
    const requestBody = {
      query: `
          query {
            games {
              _id
              title
              description
              date
              price
            }
          }
        `
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        const games = resData.data.games;
        this.setState({ games: games });
      })
      .catch(err => {
        console.log(err);
      });
  }


  submitHandler = game => {
    game.preventDefault();
    const title = this.titleEl.current.value;
    const description = this.descriptionEl.current.value;
    const price = parseFloat(this.priceEl.current.value);
    const date = new Date().toISOString();

    if (title.trim().length === 0 || description.trim().length === 0 || price.length === 0 || date.trim().length === 0) {
      return;
    }

    let requestBody = {
      query: `
      mutation {
        addGame(gameInput: {title: "${title}", description: "${description}", price: ${price}, date: "${date}"}) {
          _id
        }
      }
      `
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        alert("Success");
        this.fetchGames();
      })
      .catch(err => {
        console.log(err);
      });
  };

  updateHandler(e, id) {
    e.preventDefault();
    const title = document.getElementById('title_' + id);
    const description = document.getElementById('description_' + id);
    const price = document.getElementById('price_' + id);

    console.log()
    let requestBody = {
      query: `
      mutation {
        updateGame(updateGameInput: {id: "${id}", title: "${title.value}", description: "${description.value}", price: ${price.value}}) {
          _id
        }
      }
      `
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        alert("Success");
        this.fetchGames();
      })
      .catch(err => {
        console.log(err);
      });
  };

  deleteGame(id) {
    let requestBody = {
      query: `
      mutation {
        removeGame(gameId: "${id}") {
          _id
        }
      }
      `
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        alert("Success");
        this.fetchGames();
      })
      .catch(err => {
        console.log(err);
      });
  }

  editGame(id) {
    let div = document.getElementById(id);
    if (div.classList.contains('games__list-hidden')){
      div.classList.remove('games__list-hidden')
    }else{
      div.classList.add('games__list-hidden');
    }

  }

  render() {
    const gameList = this.state.games.map(game => {
      return (
        <li key={game._id} className="games__list-item">
          <div className="games__list-data">
              <div>
                Title - {game.title} | Description - {game.description} | Price - {game.price}
              </div>
              <div>
                <button className="games__list-button" onClick={() => this.editGame(game._id)}>Edit</button>
                <button className="games__list-button" onClick={() => this.deleteGame(game._id)}>Remove</button>            
              </div>
            </div>

            <div id={game._id} className="games__list-hidden">
                <form onSubmit={(e) => this.updateHandler(e, game._id)}>
                <div className="form-control">
                  <label htmlFor="title">Title</label>
                  <input id={"title_" + game._id} type="text" defaultValue={game.title} />
                </div>
                <div className="form-control">
                  <label htmlFor="description">description</label>
                  <input id={"description_" + game._id} type="text" defaultValue={game.description} />
                </div>
                <div className="form-control">
                  <label htmlFor="price">Price</label>
                  <input id={"price_" + game._id} type="text" defaultValue={game.price} />
                </div>
                <div className="form-actions">
                  <button type="submit">Update</button>
                </div>
              </form>
            </div>
          </li>
      );
    });


    return (
      <div className="game-form">
        <h1>Add Games to the Shop</h1>
        <form onSubmit={this.submitHandler}>
          <div className="form-control">
            <label htmlFor="title">Title</label>
            <input type="text" id="title" ref={this.titleEl} />
          </div>
          <div className="form-control">
            <label htmlFor="description">description</label>
            <input type="text" id="description" ref={this.descriptionEl} />
          </div>
          <div className="form-control">
            <label htmlFor="price">Price</label>
            <input type="text" id="price" ref={this.priceEl} />
          </div>
          <div className="form-actions">
            <button type="submit">Add Game</button>
          </div>
        </form>

        <h1>Shop</h1>
        <ul className="games__list">{gameList}</ul>
      </div>
    );
  }
}

export default MainPage;
