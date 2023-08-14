import {SkillsComponent} from './skills.component';

describe('SkillsComponent', () => {
  it('mounts', () => {
    cy.mount(SkillsComponent, {
      componentProperties: {
        skills: [
          {
            "name": "PHP",
            "percentage": 85,
            "category": "skills"
          },
          {
            "name": "Javascript",
            "percentage": 90,
            "category": "skills"
          },
          {
            "name": "Typescript",
            "percentage": 95,
            "category": "skills"
          },
          {
            "name": "CSS3 / SASS",
            "percentage": 80,
            "category": "skills"
          },
          {
            "name": "C#",
            "percentage": 70,
            "category": "skills"
          },
          {
            "name": "Angular(JS)",
            "percentage": 95,
            "category": "framework"
          },
          {
            "name": "Laravel",
            "percentage": 95,
            "category": "framework"
          },
          {
            "name": "Codeigniter",
            "percentage": 75,
            "category": "framework"
          },
          {
            "name": "dot.net",
            "percentage": 75,
            "category": "framework"
          },
          {
            "name": "NodeJS",
            "percentage": 70,
            "category": "framework"
          },
          {
            "name": "OOP",
            "percentage": 90,
            "category": "other"
          },
          {
            "name": "Functional programming",
            "percentage": 95,
            "category": "other"
          },
          {
            "name": "Reactive Programming",
            "percentage": 95,
            "category": "other"
          },
          {
            "name": "RxJS",
            "percentage": 90,
            "category": "other"
          },
          {
            "name": "Ngrx Store",
            "percentage": 90,
            "category": "other"
          }
        ]
      },
    })
    cy.get('h6').first().should('have.text', 'Professional');
    cy.get('.skillbar-title span').first().should('have.text', 'PHP');
    cy.get('.skillbar-bar').first().invoke('width').should('be.greaterThan', 0);
  })


});
