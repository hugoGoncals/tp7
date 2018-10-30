var express = require('express')
var http = require('http')
var pug = require('pug')
var fs = require('fs')
var formidable = require('formidable') 
var logger = require('morgan') 
var jsonfile = require('jsonfile')
var myBD = "ficheiros.json"
var path = require('path')

var app = express()

app.use(logger('combined'))
app.use('/uploaded/', express.static(path.join(__dirname, 'uploaded')))

app.all('*', (req, res, next)=>{
    if(req.url != '/w3.css')
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
        next()
})



app.get('/', (req, res)=>{
    res.write(pug.renderFile('form-ficheiro.pug'))
    res.end()
})
app.get('/ficheiros', (req, res)=>{
    jsonfile.readFile(myBD, (erro, ficheiros) => {
        if(!erro){ 
    res.write(pug.renderFile('lista-ficheiros.pug', {lista: ficheiros}))
    res.end()
        }else{
            res.write(pug.renderFile('erro.pug', {e: "Erro na leitura da BD"}))
            res.end()
        }
    }) 
})
app.get('/w3.css', (req, res)=>{
    res.writeHead(200, {'Content-Type': 'text/css'})
    fs.readFile('stylesheets/w3.css', (erro, dados)=>{
        if(!erro) res.write(dados)
        else res.write(pug.renderFile('erro.pug', {e: erro}))
        res.end()
    })
})
app.post('/processaForm', (req, res)=>{
    
    var form = new formidable.IncomingForm()
    form.parse(req, (erro, fields, files) => {
        var fenviado = files.ficheiro.path
        var fnovo = './uploaded/' + files.ficheiro.name
        fs.rename(fenviado, fnovo, erro => {
            if (!erro) {
                res.write(pug.renderFile('ficheiro-recebido.pug', {
                    ficheiro: files.ficheiro.name,
                    status: 'Ficheiro Recebido e guardado com sucesso' 
                })) 
                var resultado = {descricao:fields.desc, path:fnovo}
                    jsonfile.readFile(myBD, (erro, ficheiros)=>{
                        if(!erro){
                            ficheiros.push(resultado)
                            console.dir(resultado)
                            jsonfile.writeFile(myBD, ficheiros, erro =>{
                                if(erro){
                                    console.log("Erro na escrita da BD "+ erro)
                                }else{
                                    console.log("Registo gravado com sucesso")
                                }
                            })
                        }
                    //res.end(pug.renderFile('ficheiro-recebido.pug', {aluno:resultado}))
                })
            res.end()
            }else{ 
                res.write(pug.renderFile('ficheiro-recebido.pug', {e: 'Ocurreram erros'}))
                res.end()
            }
        })
    })  
})

var myServer = http.createServer(app)

    ////////////////

myServer.listen(4007, ()=>{
    console.log('servidor à escuta na porta 4006...')
})

function recuperaInfo(request, callback){
    if(request.headers['content-type'] === 'application/x-www-form-urlencoded'){
        let body = ''
        request.on('data', bloco =>{
            body = bloco.toString()
        })
        request.on('end', ()=>{
            callback(parse(body))
        })
    }else{
        callback(null)
    }
}