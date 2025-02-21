DELIMITER //

CREATE TRIGGER calcular_TL_TV_entre_zonas
BEFORE INSERT ON EN_IFM_STANDARD
FOR EACH ROW
BEGIN
    IF NEW.distancia_total IS NOT NULL AND NEW.frecuencia_recorrido IS NOT NULL THEN
        SET NEW.TL_TV = NEW.distancia_total * NEW.frecuencia_recorrido;
    ELSE
        SET NEW.TL_TV = 0;
    END IF;
END //

DELIMITER ;