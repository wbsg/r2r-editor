# --- First database schema

# --- !Ups

CREATE TABLE user (
  email                     varchar(255) not null primary key,
  password                  varchar(255) not null,
  salt                      bigint not null
);

CREATE TABLE mapping (
  id                        bigint not null auto_increment,
  uri                       varchar(1024) not null unique,
  sourcePattern             mediumtext not null,
  mappingRef                varchar(1024) null,
  isClassMapping            boolean not null,
  FOREIGN KEY (mappingRef)  REFERENCES mapping(uri) ON DELETE CASCADE,
  PRIMARY KEY (id)
);

CREATE TABLE targetpattern (
  id                        bigint not null auto_increment,
  mappingFk                 bigint not null,
  value                     mediumtext not null,
  FOREIGN KEY (mappingFk)   REFERENCES mapping(id) ON DELETE CASCADE,
  PRIMARY KEY (id)
);

CREATE INDEX targetPatternMappingId on targetPattern(mappingFk);

CREATE TABLE transformation (
  id                        bigint not null auto_increment,
  mappingFk                 bigint not null,
  value                     mediumtext not null,
  FOREIGN KEY (mappingFk)   REFERENCES mapping(id) ON DELETE CASCADE,
  PRIMARY KEY (id)
);

CREATE INDEX transformationMappingId on transformation(mappingFk);

CREATE TABLE prefixDefinition (
  prefix                    varchar(255) not null,
  namespace                 varchar(1024) not null,
  PRIMARY KEY(prefix)
);

insert into prefixDefinition values('r2r', 'http://www4.wiwiss.fu-berlin.de/bizer/r2r/');
insert into prefixDefinition values('mp', 'http://localhost:9000/mapping/');

# --- !Downs

drop table if exists user;

drop table if exists mapping;

drop table if exists targetPattern;

drop table if exists transformation;

drop table if exists prefix;

drop index if exists targetPatternMappingId;

drop index if exists transformationMappingId;