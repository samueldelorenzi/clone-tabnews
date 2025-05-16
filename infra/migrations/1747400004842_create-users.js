exports.up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    // For reference GitHub limits usernames to 39 chars
    username: {
      type: "varchar(30)",
      notNull: true,
      unique: true,
    },

    // The maximum email length is 254. Source: https://stackoverflow.com/a/1199238/23304166
    email: {
      type: "varchar(254)",
      notNull: true,
      unique: true,
    },

    // Bcrypt password limit size is 72. Source: https://security.stackexchange.com/a/39851
    password: {
      type: "varchar(72)",
      notNull: true,
    },

    // Why timestamptz: https://justatheory.com/2012/04/postgres-use-timestamptz/
    created_at: {
      type: "timestamptz",
      default: pgm.func("now()"),
    },

    updated_at: {
      type: "timestamptz",
      default: pgm.func("now()"),
    },
  });
};

exports.down = false;
