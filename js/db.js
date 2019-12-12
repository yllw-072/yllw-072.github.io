// habilitar dados offline
db.enablePersistence()
    .catch(function(err) {
        if (err.code == 'failed-precondition') {
            // provavelmente multiplas abas abertas ao mesmo tempo
            console.log('Persistencia de dados falhou');
        } else if (err.code == 'unimplemented') {
            // browser nao suporta
            console.log('Persistencia nao disponivel');
        }
    });

// real-time listener que verifica as mudanças que ocorrem
db.collection('diaristas').onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
            desenhaCard(change.doc.data(), change.doc.id);
        }
        if (change.type === 'removed') {
            // remover da pagina tambem
        }
    });
});

// adicionar novo quebragalho
const form = document.querySelector('form');
form.addEventListener('submit', evt => {
    evt.preventDefault();

    const quebragalho = {
        nome: form.diaristaNome.value,
        descricao: form.diaristaDescricao.value,
        link: form.diaristaLink.value,
        
    };

    db.collection('quebragalho').add(quebragalho)
        .catch(err => console.log(err));

    //reseta o formulario
    form.diaristaTitulo.value = '';
    form.diaristaDescricao.value = '';
    form.diaristaLink.value = '';
   
});
