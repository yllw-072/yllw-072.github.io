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

// adicionar nova sobremesa
const form = document.querySelector('form');
form.addEventListener('submit', evt => {
    evt.preventDefault();

    const diaristas = {
        nome: form.diaristasTitulo.value,
        descricao: form.diaristasDescricao.value,
        link: form.diaristasLink.value,
        endereco_imagem: form.diaristasArquivo.value
    };

    db.collection('diaristas').add(diaristas)
        .catch(err => console.log(err));

    //reseta o formulario
    form.diaristasTitulo.value = '';
    form.diaristasDescricao.value = '';
    form.diaristasLink.value = '';
    form.diaristasArquivo.value = '';

});
