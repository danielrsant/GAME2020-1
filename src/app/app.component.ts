import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Game';

  totalCards = [0, 0, 0, 0, 0];
  cardNumbers = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k', '1'];
  cardTypes = ['P', 'O', 'C', 'E'];

  allCards = [];

  player1: FormArray;
  formPlayer1: FormGroup;

  player2: FormArray;
  formPlayer2: FormGroup;

  winnersPlayer1 = 0;
  cardsPlayedPlayer1 = [];
  winnersPlayer2 = 0;
  cardsPlayedPlayer2 = [];

  destroy$ = new Subject<boolean>();

  firstPlayer = null;
  canPlay = null;

  constructor(private _formBuilder: FormBuilder, private toastr: ToastrService) { }

  ngOnInit() {
    this.generateCards();
    this.formPlayer1 = this._formBuilder.group({
      selected: new FormControl(null),
      options: this._formBuilder.array([])
    });
    this.formPlayer2 = this._formBuilder.group({
      selected: new FormControl(null),
      options: this._formBuilder.array([])
    });
    this.setLength();
  }

  generateCards() {
    this.cardNumbers.map(number => {
      this.cardTypes.map(type => {
        this.allCards.push(number + type);
      });
    });
  }

  createControls(): FormGroup {
    return new FormGroup({
      card: new FormControl(this.allCards[Math.floor(Math.random() * this.allCards.length)]),
    });
  }

  setLength() {
    this.player1 = this.formPlayer1.get('options') as FormArray;
    this.player2 = this.formPlayer2.get('options') as FormArray;

    this.totalCards.map(() => {
      this.player1.push(this.createControls());
      this.player2.push(this.createControls());
    });
  }

  setMovePlayer1(control) {
    if (!this.formPlayer2.get('selected').value && this.canPlay) {
      if (this.canPlay !== 'player1') {
        this.toastr.error(`Jogador 2 começa!!`);
        return;
      }
    }

    const card = control.get('card').value;

    if (!this.formPlayer1.get('selected').value) {

      const isValid = this.verifyPlay1(card);

      if (isValid) {
        this.cardsPlayedPlayer1.push(card);
        this.formPlayer1.get('selected').setValue(card);
        control.get('card').setValue('');
      }
    }
  }

  setMovePlayer2(control) {
    if (!this.formPlayer1.get('selected').value && this.canPlay) {
      if (this.canPlay !== 'player2') {
        this.toastr.error(`Jogador 1 começa!!`);
        return;
      }
    }

    const card = control.get('card').value;

    if (!this.formPlayer2.get('selected').value) {

      const isValid = this.verifyPlay2(card);

      if (isValid) {
        this.cardsPlayedPlayer2.push(card);
        this.formPlayer2.get('selected').setValue(card);
        control.get('card').setValue('');
      }
    }
  }

  verifyPlay1(played) {
    let isValid = true;

    if (!this.formPlayer2.get('selected').value) {
      return isValid;
    }

    const typePlayer2 = this.formPlayer2.get('selected').value.substring(this.formPlayer2.get('selected').value.length - 1);
    let typePlayer1 = played.substring(played.length - 1);

    if (typePlayer2 === typePlayer1) {
      return isValid;
    } else {
      this.formPlayer2.get('options').value.map(element => {
        typePlayer1 = element.card.substring(element.card.length - 1);
        if (typePlayer1 === typePlayer2) {
          isValid = false;
        }
        return element;
      });
    }

    if (!isValid) {
      this.toastr.error(`Carta Inválida!!`);
      return isValid;
    } else {
      return isValid;
    }
  }

  verifyPlay2(played) {
    let isValid = true;

    if (!this.formPlayer1.get('selected').value) {
      return isValid;
    }

    const typePlayer1 = this.formPlayer1.get('selected').value.substring(this.formPlayer1.get('selected').value.length - 1);
    let typePlayer2 = played.substring(played.length - 1);

    if (typePlayer1 === typePlayer2) {
      return isValid;
    } else {
      this.formPlayer2.get('options').value.map(element => {
        typePlayer2 = element.card.substring(element.card.length - 1);
        if (typePlayer2 === typePlayer1) {
          isValid = false;
        }
        return element;
      });
    }

    if (!isValid) {
      this.toastr.error(`Carta Inválida!!`);
      return isValid;
    } else {
      return isValid;
    }
  }

  verifyWinner(player) {
    if (!this.firstPlayer) {
      this.firstPlayer = player;
    }

    if (this.formPlayer1.get('selected').value && this.formPlayer2.get('selected').value) {

      const indexCardPlayer1 = this.cardNumbers.findIndex(element => element === this.getValuePlayer1());
      const indexCardPlayer2 = this.cardNumbers.findIndex(element => element === this.getValuePlayer2());

      if (indexCardPlayer1 === indexCardPlayer2) {
        this.toastr.success(`${this.firstPlayer} venceu!!`);
      } else {
        if (indexCardPlayer1 > indexCardPlayer2) {
          this.canPlay = 'player1'
          this.toastr.success('Jogador 1 venceu!!');
          this.winnersPlayer1++;
        } else {
          this.canPlay = 'player2'
          this.toastr.success('Jogador 2 venceu!!');
          this.winnersPlayer2++;
        }
      }

      this.clearPlays();
    }
  }

  getValuePlayer1() {
    return this.formPlayer1.get('selected').value.substring(0, this.formPlayer1.get('selected').value.length - 1);
  }

  getValuePlayer2() {
    return this.formPlayer2.get('selected').value.substring(0, this.formPlayer2.get('selected').value.length - 1);
  }

  clearPlays() {
    this.firstPlayer = null;
    this.formPlayer1.get('selected').setValue(null);
    this.formPlayer2.get('selected').setValue(null);
  }

  reloadGame() {
    window.location.reload();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
