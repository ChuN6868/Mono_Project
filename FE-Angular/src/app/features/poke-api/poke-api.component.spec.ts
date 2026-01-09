import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokeApiComponent } from './poke-api.component';

describe('PokeApiComponent', () => {
  let component: PokeApiComponent;
  let fixture: ComponentFixture<PokeApiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokeApiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokeApiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
