const dicionario = {
    english: {
      page_title: 'Recommendations',
      sub_title: 'Out of ideas?',
      recommend: 'Recommend',
      recommend_something: 'Recommend something',
      title: 'Title',
      description: 'Description',
      author: 'Author',
      your_name: 'Your name',
      tell_your_name: "What's your name?",
      your_name_desc: 'Your votes will be in your name.',
      user: 'User',
      sure: 'Are you sure?'
    },
    spanish: {
      page_title: 'Recomendaciones',
      sub_title: '¿Sin ideas de qué ver?',
      recommend: 'Recomendar',
      recommend_something: 'Recomendar algo',
      title: 'Título',
      description: 'Descripción',
      author: 'Autor',
      your_name: 'Tu nombre',
      tell_your_name: 'Decinos tu nombre',
      your_name_desc: 'Cuando votás los votos son en tu nombre.',
      user: 'Usuario',
      sure: '¿Seguro?'      
    },
    portuguese: {
      page_title: 'Recomendações',
      sub_title: 'Sem idea do que ver?',
      recommend: 'Recomendar',
      recommend_something: 'Recomendar algo',
      title: 'Titulo',
      description: 'Descrição',
      author: 'Autor',
      your_name: 'Seu nome',
      tell_your_name: 'Qual o seu nome?',
      your_name_desc: 'Seus votos estarão em seu nome.',
      user: 'Usuário',
      sure: 'Tem certeza?'
    }
  }

function define_dictionary(lang) {
    switch(lang) {
        case 'es':
            return dicionario.spanish;
        case 'pt':
            return dicionario.portuguese;
        case 'en':
        default:
            return dicionario.english;
    }
}

module.exports.define_dictionary = define_dictionary;