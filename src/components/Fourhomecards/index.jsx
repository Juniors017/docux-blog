import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
import React from 'react';
function Fourhomecards() {
  return (

<div className="container">

      <div className="row " style={{ margin: "5% 0 "}}>
        <div className="col col--3 margin-top--md">
          <div className="col-demo">
            <div className="card-demo">
              <div className="card">
                <div className="card__header">
                <p className="text--center"> <img width="50px" src="./img/icon/ampoule.webp"></img></p>
                  <h3 className="text--center">Image au click</h3>
                </div>
                <div className="card__body">
                <p className="text--justify">
                    Comment creer un composant qui me permet d'ajouter une image qui se verra au click ?
                    
                  </p>
                </div>
                <div className="card__footer">
                  <button className="button button--secondary button--block"><a href="#">GO !</a></button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col col--3 margin-top--md">
          <div className="col-demo">
          <div className="card-demo">
              <div className="card">
                <div className="card__header">
                <p className="text--center"> <img width="50px" src="./img/icon/css.webp"></img></p>
                  <h3 className="text--center"> CSS H2 </h3>
                </div>
                <div className="card__body">
                <p className="text--justify">
                Modifier le css de mes titres mais uniquement dans les pages markdown
                  </p>
                </div>
                <div className="card__footer">
                  <button className="button button--secondary button--block"><a href="#">GO !</a></button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col col--3 margin-top--md">
          <div className="col-demo">
          <div className="card-demo">
              <div className="card">
                <div className="card__header">
                <p className="text--center"> <img width="50px" src="./img/icon/alert.gif"></img></p>
                  <h3 className="text--center">Admonitions custom</h3>
                </div>
                <div className="card__body">
                <p className="text--justify">
                Création de mes admonitions custom de A à Z
                  </p>
                </div>
                <div className="card__footer">
                  <button className="button button--secondary button--block"><a href="#">GO !</a></button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col col--3 margin-top--md">
          <div className="col-demo">
          <div className="card-demo">
              <div className="card">
                <div className="card__header">
                <p className="text--center"> <img width="50px" src="https://em-content.zobj.net/source/joypixels-animations/366/writing-hand_270d-fe0f.gif"></img></p>
                  <h3 className="text--center">Auteurs</h3>
                </div>
                <div className="card__body">
                <p className="text--justify">
                    
un composant pour ajouter manuellement l'auteur de la doc
                  </p>
                </div>
                <div className="card__footer">
                  <button className="button button--secondary button--block"><a href="#">GO !</a></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col col--3 margin-top--md">
          <div className="col-demo">
          <div className="card-demo">
              <div className="card">
                <div className="card__header">
                <p className="text--center"> <img width="50px" src="https://em-content.zobj.net/source/telegram/386/laptop_1f4bb.webp"></img></p>
                  <h3 className="text--center">Ajouter un navigateur CSS et écrire dedans </h3>
                </div>
                <div className="card__body">
                <p className="text--justify">
                    
Un composant simple pour illustrer une apparence de navigateur en css (une alternative à celui d'origine)
                  </p>
                </div>
                <div className="card__footer">
                  <button className="button button--secondary button--block"><a href="#">GO !</a></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col col--3 margin-top--md">
          <div className="col-demo">
          <div className="card-demo">
              <div className="card">
                <div className="card__header">
                <p className="text--center"> <img width="50px" src="https://em-content.zobj.net/source/microsoft-teams/363/building-construction_1f3d7-fe0f.png"></img></p>
                  <h3 className="text--center">🏗️ Colonne à la demande</h3>
                </div>
                <div className="card__body">
                <p className="text--justify">
                    Un composant qui vous permet d'ajouter des colonnes à volonté ! 
                  </p>
                </div>
                <div className="card__footer">
                  <button className="button button--secondary button--block"><a href="#">GO !</a></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>


);
}
export default Fourhomecards; 