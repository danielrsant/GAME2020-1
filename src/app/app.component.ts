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
  cardNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'];
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

  setMovePlayer1(item) {
    if (!this.formPlayer1.get('selected').value) {
      this.cardsPlayedPlayer1.push(item.get('card').value);
      this.formPlayer1.get('selected').setValue(item.get('card').value);
      item.get('card').setValue('');
    }
  }

  setMovePlayer2(item) {
    if (!this.formPlayer2.get('selected').value) {
      this.cardsPlayedPlayer2.push(item.get('card').value);
      this.formPlayer2.get('selected').setValue(item.get('card').value);
      item.get('card').setValue('');
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
          this.toastr.success('Jogador 1 venceu!!');
          this.winnersPlayer1++;
        } else {
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
