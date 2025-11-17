export interface UserData {
  name: string;
  email: string;
  password: string;
  validated: boolean;
}

export class UserBuilder {

  private name = 'Default User';
  private email = `default-${Date.now()}@test.com`;
  private password = 'password123';
  private validated = false;

  withName(name: string) {
    this.name = name;
    return this;
  }

  withEmail(email: string) {
    this.email = email;
    return this;
  }
  
  withPassword(password: string) {
      this.password = password;
      return this;
  }

    withValidated(arg0: boolean) {
      this.validated = arg0;
      return this;
  }

  build() : UserData {
    return {
      name: this.name,
      email: this.email,
      password: this.password,
      validated: this.validated,
    };
  }
}