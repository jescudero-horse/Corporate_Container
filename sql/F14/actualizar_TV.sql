DELIMITER //

CREATE TRIGGER actualizar_TV
BEFORE UPDATE ON EN_IFM_STANDARD
FOR EACH ROW
BEGIN
    DECLARE valor DECIMAL(3, 2);

    IF NEW.speed = 10 THEN
        SET valor = 0.6;
    ELSEIF NEW.speed = 12 THEN
        SET valor = 0.5;
    ELSEIF NEW.speed = 15 THEN
        SET valor = 0.4;
    ELSEIF NEW.speed = 20 THEN
        SET valor = 0.3;
    ELSE
        SET valor = 0;
    END IF;

    IF NEW.distancia_total IS NOT NULL AND NEW.distancia_total > 0 AND NEW.cantidad_a_mover IS NOT NULL AND NEW.cantidad_a_mover > 0 THEN
        SET NEW.TV = (NEW.distancia_total * NEW.cantidad_a_mover * valor);
    ELSE
        SET NEW.TV = 0;
    END IF;
END //

DELIMITER ;